import Redis from 'ioredis';
import async from 'async';

const redis = new Redis();

redis.exists('listId', (err, exist) => {
  if (!exist) redis.set('listId', 0);
});
redis.exists('taskId', (err, exist) => {
  if (!exist) redis.set('taskId', 0);
});

const smembers = key => cb => redis.smembers(key, cb);
const hgetall = key => (id, cb) => redis.hgetall(`${key}:${id}`, cb);
const get = key => cb => redis.get(key, cb);
const srem = (key, member) => cb => redis.srem(key, member, cb);
const hdel = (key, fields) => cb => redis.hdel(key, fields, cb);

const getList = (id, cb) => hgetall('list')(id, cb);
const getTask = (id, cb) => hgetall('task')(id, cb);
const getLists = (ids, cb) => async.map(ids, getList, cb);
const getTasks = (ids, cb) => async.map(ids, getTask, cb);
const setList = label => (id, cb) =>
  redis.hmset(`list:${id}`, { id, label }, (e, r) => {
    redis.sadd('lists', id);
    cb(e, id);
});
const setTask = (listId, description) => (id, cb) =>
  redis.hmset(`task:${id}`, { id, listId, description }, (e, r) => {
    redis.sadd('tasks', id);
    cb(e, id);
});

export const init = (app) => {

  app.get('/todo/lists', (req, res) => {
    async.waterfall([
      smembers('lists'),
      getLists,
    ], (err, result) => {
      if (err) res.json({ error: err });
      res.json(result);
    });
  });

  app.post('/todo/lists', (req, res) => {
    async.waterfall([
      get('listId'),
      setList(req.body.todo.label),
      getList,
    ], (err, result) => {
      if (err) res.json({ error: err });
      redis.incr('listId');
      res.json(result);
    });
  });

  app.delete('/todo/list/:id', (req, res) => {
    const { id } = req.params;
    async.series([
      srem('lists', id),
      hdel(`list:${id}`, ['id', 'label']),
    ], (err, result) => {
      if (err) res.json({ error: err });
      res.json({ id, isDeleted: true });
    });
  });

  app.get('/todo/tasks', (req, res) => {
    async.waterfall([
      smembers('tasks'),
      getTasks,
    ], (err, result) => {
      if (err) res.json({ error: err });
      res.json(result);
    });
  });

  app.post('/todo/tasks', (req, res) => {
    async.waterfall([
      get('taskId'),
      setTask(req.body.task.listId, req.body.task.description),
      getTask,
    ], (err, result) => {
      if (err) res.json({ error: err });
      redis.incr('taskId');
      res.json(result);
    });
  });

  app.delete('/todo/task/:id', (req, res) => {
    const { id } = req.params;
    async.series([
      srem('tasks', id),
      hdel(`task:${id}`, ['id', 'listId', 'description']),
    ], (err, result) => {
      if (err) res.json({ error: err });
      res.json({ id, isDeleted: true });
    });
  });
}
