const {
    findAll,
    findById,
    create,
    update,
    remove,
    addComment,
    getComments,
    removeComment,
    getStats
} = require('../models/ForumModel');
const commonHelper = require('../helper/common');

const ForumController = {
    getAll: async (req, res) => {
        try {
            const { search, sort = 'latest', page = 1, limit = 10 } = req.query;
            const offset = (page - 1) * limit;

            const { rows } = await findAll({ search, sort, limit, offset });

            commonHelper.success(res, rows, 'Get forum topics successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    getById: async (req, res) => {
        try {
            const { id } = req.params;

            const { rows: [topic] } = await findById(id);
            if (!topic) {
                return commonHelper.notFound(res, 'Topic not found');
            }

            const { rows: comments } = await getComments(id);
            topic.comments = comments;

            commonHelper.success(res, topic, 'Get topic detail successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    createTopic: async (req, res) => {
        try {
            const { title, content, rating } = req.body;
            const userId = req.user.id;

            if (!title || !content) {
                return commonHelper.badRequest(res, 'Title and content are required');
            }

            if (rating && (rating < 1 || rating > 5)) {
                return commonHelper.badRequest(res, 'Rating must be between 1 and 5');
            }

            const { rows: [topic] } = await create({
                userId,
                title,
                content,
                rating: rating || null
            });

            commonHelper.created(res, topic, 'Topic created successfully');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    updateTopic: async (req, res) => {
        try {
            const { id } = req.params;
            const { title, content, rating } = req.body;
            const userId = req.user.id;

            if (!title && !content && !rating) {
                return commonHelper.badRequest(res, 'At least one field is required');
            }

            const { rows: [topic] } = await findById(id);
            if (!topic) {
                return commonHelper.notFound(res, 'Topic not found');
            }
            if (topic.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this topic');
            }

            const { rows: [updated] } = await update(id, { title, content, rating });

            commonHelper.success(res, updated, 'Topic updated successfully');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    deleteTopic: async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const { rows: [topic] } = await findById(id);
            if (!topic) {
                return commonHelper.notFound(res, 'Topic not found');
            }
            if (topic.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this topic');
            }

            await remove(id);

            commonHelper.success(res, null, 'Topic deleted successfully');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    createComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            const userId = req.user.id;

            if (!content) {
                return commonHelper.badRequest(res, 'Content is required');
            }

            const { rows: [topic] } = await findById(id);
            if (!topic) {
                return commonHelper.notFound(res, 'Topic not found');
            }

            const { rows: [comment] } = await addComment(id, userId, content);

            commonHelper.created(res, comment, 'Comment added successfully');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    deleteComment: async (req, res) => {
        try {
            const { comment_id } = req.params;
            const userId = req.user.id;

            const { rows: [comment] } = await pool.query(
                'SELECT * FROM forum_comments WHERE id = $1',
                [comment_id]
            );

            if (!comment) {
                return commonHelper.notFound(res, 'Comment not found');
            }
            if (comment.user_id !== userId) {
                return commonHelper.forbidden(res, 'You do not have access to this comment');
            }

            await removeComment(comment_id);

            commonHelper.success(res, null, 'Comment deleted successfully');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    getStatistics: async (req, res) => {
        try {
            const { rows: [stats] } = await getStats();

            commonHelper.success(res, stats, 'Get statistics successful');
        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = ForumController;