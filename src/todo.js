// todo.js

let listId = 4;
const lists = [
  { id: 0, label: 'test1' },
  { id: 1, label: 'test2' },
  { id: 2, label: 'test3' },
  { id: 3, label: 'test4' },
];

let taskId = 3;
const tasks = [
  { id: 0, listId: 0, description: 'yata' },
  { id: 1, listId: 0, description: 'yo' },
  { id: 2, listId: 2, description: 'yeah' },
];

export const init = (app) => {
  app.get('/todo/lists', (req, res) => {
    // TODO: get lists from redis
    res.json(lists);
  });

  app.post('/todo/lists', (req, res) => {
    const newList = { id: listId, label: req.body.todo.label };
    listId = listId + 1;
    // TODO: add newList to redis
    res.json(newList);
  });

  app.put('/todo/list/:id', (req, res) => {
    console.log('PUT /todo/list/:id');
  });

  app.delete('/todo/list/:id', (req, res) => {
    // TODO: remove list from redis
    res.json({ id: req.params.id, isDeleted: true });
  });

  app.get('/todo/tasks', (req, res) => {
    res.json(tasks);
  });

  app.post('/todo/tasks', (req, res) => {
    const newTask = {
      id: taskId,
      listId: req.body.task.listId,
      description: req.body.task.description,
    };
    taskId = taskId + 1;
    // TODO: add newTask to redis
    console.log(newTask);
    res.json(newTask);
  });

  app.put('/todo/task/:id', (req, res) => {
    console.log('PUT /todo/task/:id');
  });

  app.delete('/todo/task/:id', (req, res) => {
    // TODO: remove task from redis
    res.json({ id: req.params.id, isDeleted: true });
  });
}
