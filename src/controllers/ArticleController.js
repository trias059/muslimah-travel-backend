const ArticleModel = require('../models/ArticleModel');
const commonHelper = require('../helpers/common');

const ArticleController = {
    getAll: async (req, res, next) => {
        try {
            const { 
                search,           
                category,         
                sort = 'latest',  
                page = 1,
                limit = 10
            } = req.query;

            const offset = (page - 1) * limit;

            const { rows } = await ArticleModel.findAll({
                search,
                category,
                sort,
                limit,
                offset
            });

            const { rows: [{ count }] } = await ArticleModel.countAll({
                search,
                category
            });

            // Format response sesuai spec
            const articles = rows.map(article => {
                const date = new Date(article.created_at);
                const tanggal = date.toLocaleDateString('id-ID', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                });

                let preview = '';
                if (article.content) {
                    const strippedContent = article.content.replace(/<[^>]*>/g, '');
                    preview = strippedContent.substring(0, 100) + '...';
                }

                return {
                    id: article.id,
                    judul: article.title,
                    tanggal: tanggal,
                    preview: preview,
                    imageUrl: article.cover_image_url
                };
            });

            commonHelper.paginated(res, articles, {
                page: parseInt(page),
                total_pages: Math.ceil(count / limit),
                total_items: parseInt(count),
                per_page: parseInt(limit)
            }, 'Get articles successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    getCategories: async (req, res, next) => {
        try {
            const { rows } = await ArticleModel.findCategories();
            commonHelper.success(res, rows, 'Get categories successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    getById: async (req, res, next) => {
        try {
            const { id_or_slug } = req.params;
            
            const { rows } = await ArticleModel.findByIdOrSlug(id_or_slug);

            if (rows.length === 0) {
                return commonHelper.notFound(res, 'Article not found');
            }

            const article = rows[0];

            const date = new Date(article.created_at);
            const tanggal = date.toLocaleDateString('id-ID', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });

            // Parse sections from content (h2 tags)
            const sections = [];
            if (article.content) {
                const h2Regex = /<h2[^>]*>(.*?)<\/h2>/gi;
                let match;

                while ((match = h2Regex.exec(article.content)) !== null) {
                    const title = match[1].replace(/<[^>]*>/g, '');
                    const startIndex = match.index;
                    
                    const nextMatch = h2Regex.exec(article.content);
                    const endIndex = nextMatch ? nextMatch.index : article.content.length;
                    h2Regex.lastIndex = startIndex + match[0].length;
                    
                    const sectionContent = article.content.substring(startIndex + match[0].length, endIndex);
                    
                    sections.push({
                        title: title,
                        content: sectionContent.trim(),
                        imageUrl: article.cover_image_url
                    });
                }
            }

            // Response sesuai spec
            const responseData = {
                judul: article.title,
                tanggal: tanggal,
                content: article.content,
                imageUrl: article.cover_image_url,
                sections: sections
            };

            commonHelper.success(res, responseData, 'Get article successful');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    },

    incrementView: async (req, res, next) => {
        try {
            const { id } = req.params;

            const { rows } = await ArticleModel.incrementView(id);

            if (rows.length === 0) {
                return commonHelper.notFound(res, 'Article not found');
            }

            const response = {
                article_id: rows[0].id,
                total_views: rows[0].views
            };

            commonHelper.success(res, response, 'View counted');

        } catch (error) {
            console.log(error);
            commonHelper.error(res, 'Server error', 500);
        }
    }
};

module.exports = ArticleController;