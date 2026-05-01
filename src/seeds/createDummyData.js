require("dotenv").config();
const bcrypt = require("bcrypt");

const { sequelize, User, Post, Comment, UserFollow } = require("../models");

/* ---------------- PROFILE PICS ---------------- */

const PROFILE_PICS = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKKEDhC14XEw9__RaNyNK2kDNuttrrNT7XtA&s",
  "https://i.pinimg.com/474x/5e/af/88/5eaf88e37cd1bc501da3dc1a80de417c.jpg",
  "https://alchetron.com/cdn/chris-evans-actor-069cdfa5-2c3c-445b-a858-63847399897-resize-750.jpeg",
  "https://w0.peakpx.com/wallpaper/397/83/HD-wallpaper-tv-show-peaky-blinders-cillian-murphy-thomas-shelby.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTH72v_d9nyIMo2kO-iXe-0_B7tPpx4y-Umrw&s",
];

/* ---------------- CONFIG ---------------- */

const CONFIG = {
  USERS: 10,
  POSTS_PER_USER: 10,
  COMMENTS_PER_POST: 10,
  MIN_FOLLOWING: 2,
  MAX_FOLLOWING: 5,
  BATCH_SIZE: 1000,
};

/* ---------------- HELPERS ---------------- */

const chunk = (start, size, fn) => {
  const arr = [];
  for (let i = 0; i < size; i++) {
    arr.push(fn(start + i + 1));
  }
  return arr;
};

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const sampleBios = [
  "Tech enthusiast 🚀",
  "Coffee lover ☕",
  "Full-stack developer 💻",
  "Open-source contributor",
  "Loves building APIs",
  "Minimalist coder",
  "JavaScript addict ⚡",
  "Learning backend systems",
];

const getRandomBio = () =>
  sampleBios[Math.floor(Math.random() * sampleBios.length)];

/* ---------------- SEED ---------------- */

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to DB");

    const hashedPassword = await bcrypt.hash("9898", 10);

    /* ======================================================
       USERS
    ====================================================== */

    console.log("Starting USERS insertion...");

    let userIds = [];
    let userInserted = 0;

    for (let i = 0; i < CONFIG.USERS; i += CONFIG.BATCH_SIZE) {
      const users = chunk(
        i,
        Math.min(CONFIG.BATCH_SIZE, CONFIG.USERS - i),
        (index) => {
          const dp = PROFILE_PICS[(index - 1) % PROFILE_PICS.length];

          return {
            name: `u${index}`,
            email: `u${index}@gmail.com`,
            password: hashedPassword,
            role: "user",
            bio: getRandomBio(),
            profilePicture: dp,

            postsCount: 0,
            followersCount: 0,
            followingCount: 0,
          };
        },
      );

      const inserted = await User.bulkCreate(users, { returning: true });

      userIds.push(...inserted.map((u) => u.id));
      userInserted += inserted.length;

      console.log(`Users inserted: ${userInserted}`);
    }

    console.log(`USERS DONE: ${userInserted}`);

    /* ======================================================
       POSTS
    ====================================================== */

    console.log("Starting POSTS insertion...");

    let posts = [];
    let postInserted = 0;
    const postCountMap = {};

    for (let userId of userIds) {
      postCountMap[userId] = CONFIG.POSTS_PER_USER;

      for (let i = 0; i < CONFIG.POSTS_PER_USER; i++) {
        posts.push({
          userId,
          content: `post_user_${userId}_${i}`,
        });

        if (posts.length === CONFIG.BATCH_SIZE) {
          const inserted = await Post.bulkCreate(posts);
          postInserted += inserted.length;
          posts = [];
          console.log(`Posts inserted: ${postInserted}`);
        }
      }
    }

    if (posts.length) {
      const inserted = await Post.bulkCreate(posts);
      postInserted += inserted.length;
    }

    console.log(`POSTS DONE: ${postInserted}`);

    /* update posts count */
    for (const userId of Object.keys(postCountMap)) {
      await User.update(
        { postsCount: postCountMap[userId] },
        { where: { id: userId } },
      );
    }

    console.log("POST COUNTS UPDATED");

    /* ======================================================
       COMMENTS
    ====================================================== */

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
          const inserted = await Comment.bulkCreate(comments);
          commentInserted += inserted.length;
          comments = [];
          console.log(`Comments inserted: ${commentInserted}`);
        }
      }
    }

    if (comments.length) {
      const inserted = await Comment.bulkCreate(comments);
      commentInserted += inserted.length;
    }

    console.log(`COMMENTS DONE: ${commentInserted}`);

    /* ======================================================
       FOLLOW SYSTEM
    ====================================================== */

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

        if (followerId === followingId) continue;

        const key = `${followerId}-${followingId}`;
        if (followMap.has(key)) continue;

        followMap.add(key);

        follows.push({ followerId, followingId });
      }
    }

    const insertedFollows = await UserFollow.bulkCreate(follows);

    console.log(`FOLLOWS DONE: ${insertedFollows.length}`);

    /* update follow counts */

    for (const userId of userIds) {
      const followersCount = await UserFollow.count({
        where: { followingId: userId },
      });

      const followingCount = await UserFollow.count({
        where: { followerId: userId },
      });

      await User.update(
        { followersCount, followingCount },
        { where: { id: userId } },
      );
    }

    console.log("FOLLOW COUNTS UPDATED");

    /* ======================================================
       DONE
    ====================================================== */

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
