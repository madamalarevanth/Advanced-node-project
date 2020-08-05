const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');

const Blog = mongoose.model('Blog');

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });

    res.send(blog);
  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const redis = require('redis');
    const redisUrl = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisUrl);
    const util = require('util');

    //it promisify, so that we dont have 
    //to pass a callback
    client.get = util.promisify(client.get);

    //do we have any cache data in redis related 
    //to this query
    const cachedBlogs = await client.get(req.user.id);

    //objects inside redis are passed as json

    //if yes, respond to request and return 
    //the parsed json value
    if (cachedBlogs){
      console.log('Serving from cache');
      return res.send(JSON.parse(cachedBlogs));
    }

    //if not, we need to respond to request and 
    //update our cache data
    const blogs = await Blog.find({ _user: req.user.id });
    console.log('serving from mongo');
    res.send(blogs);

    client.set(req.user.id,JSON.stringify(blogs));
  });

  app.post('/api/blogs', requireLogin, async (req, res) => {
    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }
  });
};
