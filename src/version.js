//
export function init(app, resources) {
  app.get('/version', function(req, res) {
    res.json({ version: resources.version });
  });
}
