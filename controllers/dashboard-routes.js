const router = require('express').Router();
const sequelize = require('../config/connection');
const withAuth = require('../utils/auth');
const { Post, User, Comment } = require('../models');

// /dashboard
router.get('/', withAuth, (req, res) => {
  console.log(req.session);
  Post.findAll({
    where: {
      // use the ID from the session
      user_id: req.session.user_id,
    },
    order: [['created_at', 'DESC']],
    attributes: ['id', 'title', 'post_text', 'created_at'],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username'],
        },
      },
      {
        model: User,
        attributes: ['username'],
      },
    ],
  })
    .then((dbPostData) => {
      // serialize data before passing to template
      const posts = dbPostData.map((post) => post.get({ plain: true }));
      res.render('dashboard', { posts, loggedIn: true });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

// GET route for editing posts
router.get('/edit/:id', withAuth, (req, res) => {
  Post.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ['id', 'title', 'post_text', 'created_at'],
    include: [
      {
        model: Comment,
        attributes: ['id', 'comment_text', 'post_id', 'user_id', 'created_at'],
        include: {
          model: User,
          attributes: ['username'],
        },
      },
      {
        model: User,
        attributes: ['username'],
      },
    ],
  })
    .then((dbPostData) => {
      if (!dbPostData) {
        res.status(404).json({ message: 'Post with that id does not exist' });
        return;
      }

      // serialize the data
      const post = dbPostData.get({ plain: true });

      res.render('edit-post', {
        post,
        loggedIn: true,
      });
    })
    .catch((err) => res.status(500).json(err));
});

module.exports = router;
