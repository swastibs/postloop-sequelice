require("dotenv").config();
const bcrypt = require("bcrypt");

const { sequelize, User, Post, Comment, UserFollow } = require("../models");

const CONFIG = {
  USERS: 10,
  POSTS_PER_USER: 10,
  COMMENTS_PER_POST: 10,

  MIN_FOLLOWING: 2,
  MAX_FOLLOWING: 5,

  BATCH_SIZE: 1000,
};

const chunk = (start, size, fn) => {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(fn(start + i + 1));
  }
  return arr;
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");

    const hashedPassword = await bcrypt.hash("9898", 10);

    /* ---------------- USERS ---------------- */

    console.log("Starting USERS insertion...");

    let userIds = [];
    let userInserted = 0;

    for (let i = 0; i < CONFIG.USERS; i += CONFIG.BATCH_SIZE) {
      const users = chunk(
        i,
        Math.min(CONFIG.BATCH_SIZE, CONFIG.USERS - i),
        (index) => ({
          name: `u${index}`,
          email: `u${index}@gmail.com`,
          password: hashedPassword,
          role: "user",
          followersCount: 0,
          followingCount: 0,
        }),
      );

      const inserted = await User.bulkCreate(users, {
        returning: true,
        ignoreDuplicates: true,
      });

      userIds.push(...inserted.map((u) => u.id));
      userInserted += inserted.length;

      console.log(`Users inserted: ${userInserted}`);
    }

    console.log(`USERS DONE: ${userInserted}`);

    /* ---------------- POSTS ---------------- */

    console.log("Starting POSTS insertion...");

    let posts = [];
    let postInserted = 0;

    for (let userId of userIds) {
      for (let i = 0; i < CONFIG.POSTS_PER_USER; i++) {
        posts.push({
          userId,
          content: `post_user_${userId}_${i}`,
        });

        if (posts.length === CONFIG.BATCH_SIZE) {
          const inserted = await Post.bulkCreate(posts, {
            ignoreDuplicates: true,
          });

          postInserted += inserted.length;

          console.log(`Posts inserted: ${postInserted}`);

          posts = [];
        }
      }
    }

    if (posts.length) {
      const inserted = await Post.bulkCreate(posts, {
        ignoreDuplicates: true,
      });

      postInserted += inserted.length;
    }

    console.log(`POSTS DONE: ${postInserted}`);

    /* ---------------- COMMENTS ---------------- */

    console.log("Starting COMMENTS insertion...");

    const allPosts = await Post.findAll({
      attributes: ["id"],
      raw: true,
    });

    let comments = [];
    let commentInserted = 0;

    for (let post of allPosts) {
      for (let i = 0; i < CONFIG.COMMENTS_PER_POST; i++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];

        comments.push({
          postId: post.id,
          userId: randomUser,
          content: `comment_post_${post.id}_${i}`,
        });

        if (comments.length === CONFIG.BATCH_SIZE) {
          const inserted = await Comment.bulkCreate(comments, {
            ignoreDuplicates: true,
          });

          commentInserted += inserted.length;

          console.log(`Comments inserted: ${commentInserted}`);

          comments = [];
        }
      }
    }

    if (comments.length) {
      const inserted = await Comment.bulkCreate(comments, {
        ignoreDuplicates: true,
      });

      commentInserted += inserted.length;
    }

    console.log(`COMMENTS DONE: ${commentInserted}`);

    /* ---------------- FOLLOWS ---------------- */

    console.log("Starting FOLLOW relationships...");

    const followMap = new Set();
    const follows = [];

    for (const followerId of userIds) {
      const followCount = randomInt(
        CONFIG.MIN_FOLLOWING,
        Math.min(CONFIG.MAX_FOLLOWING, userIds.length - 1),
      );

      while (
        [...followMap].filter((x) => x.startsWith(`${followerId}-`)).length <
        followCount
      ) {
        const followingId = userIds[Math.floor(Math.random() * userIds.length)];

        if (followerId === followingId) {
          continue;
        }

        const key = `${followerId}-${followingId}`;

        if (followMap.has(key)) {
          continue;
        }

        followMap.add(key);

        follows.push({
          followerId,
          followingId,
        });
      }
    }

    const insertedFollows = await UserFollow.bulkCreate(follows, {
      ignoreDuplicates: true,
    });

    console.log(`FOLLOWS DONE: ${insertedFollows.length}`);

    /* -------- update follower counters -------- */

    console.log("Updating follower/following counters...");

    for (const userId of userIds) {
      const followersCount = await UserFollow.count({
        where: {
          followingId: userId,
        },
      });

      const followingCount = await UserFollow.count({
        where: {
          followerId: userId,
        },
      });

      await User.update(
        {
          followersCount,
          followingCount,
        },
        {
          where: { id: userId },
        },
      );
    }

    console.log("FOLLOW COUNTS UPDATED");

    console.log("SEEDING COMPLETED SUCCESSFULLY");

    console.log({
      users: userInserted,
      posts: postInserted,
      comments: commentInserted,
      follows: insertedFollows.length,
    });

    process.exit(0);
  } catch (err) {
    console.error("Seeder failed:", err);

    process.exit(1);
  }
};

seed();
