import Elysia from "elysia";
import { readFile } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

// Helper function to read and parse the meta file
async function readMetaFile() {
  const metaFilePath = join(
    homedir(),
    "Public",
    "super-productivity",
    "__meta_",
  );
  const fileContent = await readFile(metaFilePath, "utf-8");
  const jsonString = fileContent.replace(/^pf_[\d.]+__/, "");
  return JSON.parse(jsonString);
}

// Helper function to get project name
function getProjectName(projectId: string, projects: any): string {
  if (!projectId) return "Inbox";
  const project = projects.entities[projectId];
  return project?.title || "Unknown";
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export const tasksApp = new Elysia({ prefix: "/tasks" })
  .get("/today", async () => {
    try {
      const data = await readMetaFile();
      const tasks = data.mainModelData.task;
      const projects = data.mainModelData.project;

      // Get today's tag tasks
      const todayTag = data.mainModelData.tag.entities.TODAY;
      const todayTaskIds = todayTag?.taskIds || [];

      // Get today's date in YYYY-MM-DD format
      const todayString = formatDate(new Date());

      // Build task list
      const taskList = todayTaskIds
        .map((taskId: string) => {
          const task = tasks.entities[taskId];
          if (!task) return null;

          // Filter: only include tasks with dueDay set to today
          if (task.dueDay !== todayString) return null;

          return {
            name: task.title,
            project: getProjectName(task.projectId, projects),
            isDone: task.isDone || false,
          };
        })
        .filter(Boolean);

      return taskList;
    } catch (error) {
      throw new Error(`Failed to read tasks: ${error}`);
    }
  })
  .get("/recent", async () => {
    try {
      const data = await readMetaFile();
      const tasks = data.mainModelData.task;
      const projects = data.mainModelData.project;

      // Get date range: today to 7 days from now
      const today = new Date();
      const sevenDaysLater = new Date(today);
      sevenDaysLater.setDate(today.getDate() + 6);

      const todayString = formatDate(today);
      const sevenDaysLaterString = formatDate(sevenDaysLater);

      // Get all tasks from all projects
      const allTaskIds: string[] = [];
      for (const projectId of projects.ids) {
        const project = projects.entities[projectId];
        if (project?.taskIds) {
          allTaskIds.push(...project.taskIds);
        }
      }

      // Build task list with tasks due in the next 7 days
      const taskList = allTaskIds
        .map((taskId: string) => {
          const task = tasks.entities[taskId];
          if (!task) return null;

          // Filter: only include tasks with dueDay in the next 7 days
          if (!task.dueDay) return null;
          if (task.dueDay < todayString || task.dueDay > sevenDaysLaterString) {
            return null;
          }

          return {
            name: task.title,
            project: getProjectName(task.projectId, projects),
            isDone: task.isDone || false,
            dueDate: task.dueDay,
          };
        })
        .filter(Boolean);

      return taskList;
    } catch (error) {
      throw new Error(`Failed to read tasks: ${error}`);
    }
  })
  .get("/projects", async () => {
    try {
      const data = await readMetaFile();
      const tasks = data.mainModelData.task;
      const projects = data.mainModelData.project;

      // Build result object grouped by project
      const projectTasks: Record<
        string,
        Array<{ name: string; dueDate: string | null; isDone: boolean }>
      > = {};

      // Iterate through all projects
      for (const projectId of projects.ids) {
        const project = projects.entities[projectId];
        if (!project) continue;

        const projectName = project.title;
        const taskList: Array<{
          name: string;
          dueDate: string | null;
          isDone: boolean;
        }> = [];

        // Get all tasks for this project
        if (project.taskIds && project.taskIds.length > 0) {
          for (const taskId of project.taskIds) {
            const task = tasks.entities[taskId];
            if (!task) continue;

            taskList.push({
              name: task.title,
              dueDate: task.dueDay || null,
              isDone: task.isDone || false,
            });
          }
        }

        // Sort tasks: first by isDone (false first), then by dueDate (earlier first)
        taskList.sort((a, b) => {
          // Sort by isDone first (incomplete tasks first)
          if (a.isDone !== b.isDone) {
            return a.isDone ? 1 : -1;
          }

          // Then sort by dueDate (earlier dates first)
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1; // Tasks without dueDate go to the end
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        });

        // Only add projects that have tasks
        if (taskList.length > 0) {
          projectTasks[projectName] = taskList;
        }
      }

      return projectTasks;
    } catch (error) {
      throw new Error(`Failed to read tasks: ${error}`);
    }
  });
