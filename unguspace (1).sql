-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 24, 2026 at 09:14 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `unguspace`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `profil_user` (IN `user_id` CHAR(36))   BEGIN
    SELECT
        u.nama_lengkap,
        u.prodi,
        u.bio,
        u.avatar_url,
        COUNT(DISTINCT p.id_post) AS total_post,
        COUNT(DISTINCT f1.following_id) AS total_mengikuti,
        COUNT(DISTINCT f2.follower_id) AS total_pengikut,
        SUM(p.like_count) AS total_like_didapat
    FROM users u
    LEFT JOIN posts p ON u.id_user = p.id_user
    LEFT JOIN follows f1 ON u.id_user = f1.follower_id
    LEFT JOIN follows f2 ON u.id_user = f2.following_id
    WHERE u.id_user = user_id
    GROUP BY u.id_user;
END$$

--
-- Functions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `jumlah_post` (`user_id` CHAR(36)) RETURNS INT(11) DETERMINISTIC BEGIN
    DECLARE jumlah INT;
    SELECT COUNT(*) INTO jumlah FROM posts WHERE id_user = user_id;
    RETURN jumlah;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `comments`
--

CREATE TABLE `comments` (
  `id_comment` char(36) NOT NULL,
  `id_post` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `isi_komentar` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `comments`
--

INSERT INTO `comments` (`id_comment`, `id_post`, `id_user`, `isi_komentar`, `created_at`, `updated_at`) VALUES
('3d65229e-5385-11f1-a76c-005056c00001', '1bacd91a-5385-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', 'Keren banget desainnya!', '2026-05-19 13:18:35', '2026-05-19 13:18:35'),
('3d6528f6-5385-11f1-a76c-005056c00001', '1bacf1ee-5385-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', 'Filmnya bagus, ceritanya relatable', '2026-05-19 13:18:35', '2026-05-19 13:18:35'),
('3d652b06-5385-11f1-a76c-005056c00001', '1bad0950-5385-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', 'Bisa join timnya?', '2026-05-19 13:18:35', '2026-05-19 13:18:35');

-- --------------------------------------------------------

--
-- Table structure for table `follows`
--

CREATE TABLE `follows` (
  `follower_id` char(36) NOT NULL,
  `following_id` char(36) NOT NULL,
  `followed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `follows`
--

INSERT INTO `follows` (`follower_id`, `following_id`, `followed_at`) VALUES
('b3e1ef4c-5384-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', '2026-05-19 13:19:43'),
('b3e1f516-5384-11f1-a76c-005056c00001', 'b3e2064b-5384-11f1-a76c-005056c00001', '2026-05-19 13:19:43'),
('b3e2064b-5384-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', '2026-05-19 13:19:43');

-- --------------------------------------------------------

--
-- Table structure for table `likes`
--

CREATE TABLE `likes` (
  `id_like` char(36) NOT NULL,
  `id_post` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `likes`
--

INSERT INTO `likes` (`id_like`, `id_post`, `id_user`, `created_at`) VALUES
('51f1af1d-5385-11f1-a76c-005056c00001', '1bacd91a-5385-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', '2026-05-19 13:19:09'),
('51f1cf70-5385-11f1-a76c-005056c00001', '1bacf1ee-5385-11f1-a76c-005056c00001', 'b3e2064b-5384-11f1-a76c-005056c00001', '2026-05-19 13:19:09'),
('51f1d205-5385-11f1-a76c-005056c00001', '1bad0950-5385-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', '2026-05-19 13:19:09');

--
-- Triggers `likes`
--
DELIMITER $$
CREATE TRIGGER `update_like` AFTER INSERT ON `likes` FOR EACH ROW BEGIN
    UPDATE posts
    SET like_count = like_count + 1
    WHERE id_post = NEW.id_post;
 
    INSERT INTO notifications (id_notif, id_user, actor_id, reference_id, tipe, pesan)
    SELECT
        UUID(),
        p.id_user,
        NEW.id_user,
        NEW.id_post,
        'like',
        CONCAT((SELECT nama_lengkap FROM users WHERE id_user = NEW.id_user), ' menyukai postinganmu')
    FROM posts p
    WHERE p.id_post = NEW.id_post
      AND p.id_user != NEW.id_user; -- supaya nggak notif diri sendiri saat like post sendiri
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id_notif` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `actor_id` char(36) DEFAULT NULL,
  `reference_id` char(36) DEFAULT NULL,
  `tipe` varchar(20) NOT NULL,
  `pesan` text DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id_notif`, `id_user`, `actor_id`, `reference_id`, `tipe`, `pesan`, `is_read`, `created_at`) VALUES
('89c6a1d2-5385-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', '1bacd91a-5385-11f1-a76c-005056c00001', 'like', 'Sinta Dewi menyukai postinganmu', 0, '2026-05-19 13:20:43'),
('89c6a7ed-5385-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', '3d65229e-5385-11f1-a76c-005056c00001', 'comment', 'Ahmad Fauzi mengomentari postinganmu', 0, '2026-05-19 13:20:43'),
('89c6b835-5385-11f1-a76c-005056c00001', 'b3e2064b-5384-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', NULL, 'follow', 'Sinta Dewi mengikuti kamu', 1, '2026-05-19 13:20:43');

-- --------------------------------------------------------

--
-- Table structure for table `posts`
--

CREATE TABLE `posts` (
  `id_post` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `konten_teks` text DEFAULT NULL,
  `media_url` text DEFAULT NULL,
  `media_type` varchar(20) DEFAULT NULL,
  `kategori` varchar(50) DEFAULT NULL,
  `visibility` varchar(20) DEFAULT 'public',
  `like_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `posts`
--

INSERT INTO `posts` (`id_post`, `id_user`, `konten_teks`, `media_url`, `media_type`, `kategori`, `visibility`, `like_count`, `created_at`, `updated_at`) VALUES
('1bacd91a-5385-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', 'Project UI/UX Mobile App Amikom', 'https://example.com/img1.jpg', 'image', 'UIUX', 'public', 12, '2026-05-19 13:17:38', '2026-05-19 13:17:38'),
('1bacf1ee-5385-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', 'Short Film \"Langkah Kecil\"', 'https://example.com/video1.mp4', 'video', 'Film', 'public', 8, '2026-05-19 13:17:38', '2026-05-19 13:17:38'),
('1bad0950-5385-11f1-a76c-005056c00001', 'b3e2064b-5384-11f1-a76c-005056c00001', 'Cari tim untuk lomba hackathon!', 'https://example.com/img2.jpg', 'image', 'Event', 'public', 15, '2026-05-19 13:17:38', '2026-05-19 13:17:38');

-- --------------------------------------------------------

--
-- Stand-in structure for view `post_feed`
-- (See below for the actual view)
--
CREATE TABLE `post_feed` (
`id_post` char(36)
,`konten_teks` text
,`media_url` text
,`media_type` varchar(20)
,`kategori` varchar(50)
,`like_count` int(11)
,`created_at` timestamp
,`nama_user` varchar(100)
,`prodi` varchar(50)
,`avatar_url` varchar(255)
,`jumlah_komentar` bigint(21)
);

-- --------------------------------------------------------

--
-- Table structure for table `saved_posts`
--

CREATE TABLE `saved_posts` (
  `id_saved` char(36) NOT NULL,
  `id_user` char(36) NOT NULL,
  `id_post` char(36) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `saved_posts`
--

INSERT INTO `saved_posts` (`id_saved`, `id_user`, `id_post`, `saved_at`) VALUES
('ad577611-5385-11f1-a76c-005056c00001', 'b3e1ef4c-5384-11f1-a76c-005056c00001', '1bacf1ee-5385-11f1-a76c-005056c00001', '2026-05-19 13:21:42'),
('ad577b79-5385-11f1-a76c-005056c00001', 'b3e1f516-5384-11f1-a76c-005056c00001', '1bacd91a-5385-11f1-a76c-005056c00001', '2026-05-19 13:21:42'),
('ad577d21-5385-11f1-a76c-005056c00001', 'b3e2064b-5384-11f1-a76c-005056c00001', '1bad0950-5385-11f1-a76c-005056c00001', '2026-05-19 13:21:42');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id_user` char(36) NOT NULL,
  `nim` varchar(20) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `email_amikom` varchar(100) NOT NULL,
  `prodi` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `bio` text DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id_user`, `nim`, `nama_lengkap`, `email_amikom`, `prodi`, `password_hash`, `bio`, `avatar_url`, `is_verified`, `created_at`, `updated_at`) VALUES
('b3e1ef4c-5384-11f1-a76c-005056c00001', '23.01.1234', 'Ahmad Fauzi', 'ahmad.fauzi@student.amikom.ac.id', 'Informatika', 'ahmad123', 'Frontend Developer', NULL, 1, '2026-05-19 13:14:44', '2026-05-19 13:14:44'),
('b3e1f516-5384-11f1-a76c-005056c00001', '23.02.5678', 'Sinta Dewi', 'sinta.dewi@student.amikom.ac.id', 'Manajemen Informatika', 'sinta456', 'UI/UX Enthusiast', NULL, 1, '2026-05-19 13:14:44', '2026-05-19 13:14:44'),
('b3e2064b-5384-11f1-a76c-005056c00001', '23.03.9012', 'Budi Santoso', 'budi.santoso@student.amikom.ac.id', 'Teknik Informatika', 'budi789', 'Content Creator & Video Editor', NULL, 1, '2026-05-19 13:14:44', '2026-05-19 13:14:44');

-- --------------------------------------------------------

--
-- Structure for view `post_feed`
--
DROP TABLE IF EXISTS `post_feed`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `post_feed`  AS SELECT `p`.`id_post` AS `id_post`, `p`.`konten_teks` AS `konten_teks`, `p`.`media_url` AS `media_url`, `p`.`media_type` AS `media_type`, `p`.`kategori` AS `kategori`, `p`.`like_count` AS `like_count`, `p`.`created_at` AS `created_at`, `u`.`nama_lengkap` AS `nama_user`, `u`.`prodi` AS `prodi`, `u`.`avatar_url` AS `avatar_url`, (select count(0) from `comments` `c` where `c`.`id_post` = `p`.`id_post`) AS `jumlah_komentar` FROM (`posts` `p` join `users` `u` on(`p`.`id_user` = `u`.`id_user`)) WHERE `p`.`visibility` = 'public' ORDER BY `p`.`created_at` DESC ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `comments`
--
ALTER TABLE `comments`
  ADD PRIMARY KEY (`id_comment`),
  ADD KEY `id_post` (`id_post`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `follows`
--
ALTER TABLE `follows`
  ADD PRIMARY KEY (`follower_id`,`following_id`),
  ADD KEY `following_id` (`following_id`);

--
-- Indexes for table `likes`
--
ALTER TABLE `likes`
  ADD PRIMARY KEY (`id_like`),
  ADD UNIQUE KEY `unique_like` (`id_post`,`id_user`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id_notif`),
  ADD KEY `id_user` (`id_user`),
  ADD KEY `actor_id` (`actor_id`);

--
-- Indexes for table `posts`
--
ALTER TABLE `posts`
  ADD PRIMARY KEY (`id_post`),
  ADD KEY `id_user` (`id_user`);

--
-- Indexes for table `saved_posts`
--
ALTER TABLE `saved_posts`
  ADD PRIMARY KEY (`id_saved`),
  ADD UNIQUE KEY `unique_save` (`id_user`,`id_post`),
  ADD KEY `id_post` (`id_post`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id_user`),
  ADD UNIQUE KEY `nim` (`nim`),
  ADD UNIQUE KEY `email_amikom` (`email_amikom`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `comments`
--
ALTER TABLE `comments`
  ADD CONSTRAINT `comments_ibfk_1` FOREIGN KEY (`id_post`) REFERENCES `posts` (`id_post`) ON DELETE CASCADE,
  ADD CONSTRAINT `comments_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `follows`
--
ALTER TABLE `follows`
  ADD CONSTRAINT `follows_ibfk_1` FOREIGN KEY (`follower_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `follows_ibfk_2` FOREIGN KEY (`following_id`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `likes`
--
ALTER TABLE `likes`
  ADD CONSTRAINT `likes_ibfk_1` FOREIGN KEY (`id_post`) REFERENCES `posts` (`id_post`) ON DELETE CASCADE,
  ADD CONSTRAINT `likes_ibfk_2` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `notifications_ibfk_2` FOREIGN KEY (`actor_id`) REFERENCES `users` (`id_user`) ON DELETE SET NULL;

--
-- Constraints for table `posts`
--
ALTER TABLE `posts`
  ADD CONSTRAINT `posts_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE;

--
-- Constraints for table `saved_posts`
--
ALTER TABLE `saved_posts`
  ADD CONSTRAINT `saved_posts_ibfk_1` FOREIGN KEY (`id_user`) REFERENCES `users` (`id_user`) ON DELETE CASCADE,
  ADD CONSTRAINT `saved_posts_ibfk_2` FOREIGN KEY (`id_post`) REFERENCES `posts` (`id_post`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
