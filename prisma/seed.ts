import { PrismaClient, Priority, Status } from "@prisma/client";

const prisma = new PrismaClient();

const sampleTasks = [
  {
    title: "Buy groceries",
    description: "Milk, eggs, bread, apples, and orange juice",
    dueDate: new Date("2024-07-01"),
    priority: Priority.HIGH,
    status: Status.TODO,
  },
  {
    title: "Schedule dentist appointment",
    description: "Call Dr. Smith's office for a cleaning",
    dueDate: new Date("2024-07-05"),
    priority: Priority.MEDIUM,
    status: Status.TODO,
  },
  {
    title: "Finish project proposal",
    description:
      "Complete the draft proposal for the new client project and send for review",
    dueDate: new Date("2024-06-28"),
    priority: Priority.HIGH,
    status: Status.DONE,
  },
  {
    title: "Clean the garage",
    description: null,
    dueDate: new Date("2024-07-15"),
    priority: Priority.LOW,
    status: Status.TODO,
  },
  {
    title: "Read chapter 5 of design patterns book",
    description: "Focus on the Observer and Strategy patterns",
    dueDate: null,
    priority: Priority.LOW,
    status: Status.TODO,
  },
  {
    title: "Update resume",
    description: "Add recent project experience and update skills section",
    dueDate: new Date("2024-07-10"),
    priority: Priority.MEDIUM,
    status: Status.TODO,
  },
  {
    title: "Pay electricity bill",
    description: "Due amount is $142.50",
    dueDate: new Date("2024-06-30"),
    priority: Priority.HIGH,
    status: Status.DONE,
  },
  {
    title: "Plan weekend hiking trip",
    description:
      "Research trails near the national park and check weather forecast",
    dueDate: new Date("2024-07-12"),
    priority: Priority.LOW,
    status: Status.TODO,
  },
  {
    title: "Fix leaking kitchen faucet",
    description: "Buy replacement washer from hardware store first",
    dueDate: new Date("2024-07-03"),
    priority: Priority.MEDIUM,
    status: Status.TODO,
  },
  {
    title: "Send birthday card to Mom",
    description: null,
    dueDate: new Date("2024-07-08"),
    priority: Priority.HIGH,
    status: Status.TODO,
  },
  {
    title: "Organize photo library",
    description:
      "Sort photos from the last vacation into albums and delete duplicates",
    dueDate: null,
    priority: null,
    status: Status.TODO,
  },
  {
    title: "Review pull requests",
    description: "Check the three open PRs on the todo-app repository",
    dueDate: new Date("2024-06-27"),
    priority: Priority.MEDIUM,
    status: Status.DONE,
  },
  {
    title: "Renew gym membership",
    description: null,
    dueDate: new Date("2024-07-20"),
    priority: Priority.LOW,
    status: Status.TODO,
  },
  {
    title: "Prepare presentation slides",
    description:
      "Create slides for the team meeting on Monday covering Q2 results",
    dueDate: new Date("2024-07-07"),
    priority: Priority.HIGH,
    status: Status.TODO,
  },
  {
    title: "Water the plants",
    description: null,
    dueDate: null,
    priority: null,
    status: Status.DONE,
  },
];

async function main() {
  console.log("Seeding database...");

  for (const task of sampleTasks) {
    await prisma.task.create({
      data: task,
    });
  }

  console.log(`Seeded ${sampleTasks.length} tasks.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Error seeding database:", e);
    await prisma.$disconnect();
    process.exit(1);
  });