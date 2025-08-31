import axios from 'axios';

// GitHub API Service
export const githubService = {
    // Extract username from GitHub URL
    extractUsername: (url) => {
        if (!url) return null;
        const match = url.match(/github\.com\/([^/?]+)/);
        return match ? match[1] : null;
    },

    // Get GitHub contributions using third-party API
    getContributions: async (username) => {
        try {
            const response = await axios.get(`https://github-contributions-api.jogruber.de/v4/${username}`);
            return response.data;
        } catch (error) {
            console.error('GitHub contributions API error:', error);
            return null;
        }
    },

    // Get user repositories
    getUserRepos: async (username, limit = 6) => {
        try {
            const response = await axios.get(
                `https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}`
            );
            return response.data;
        } catch (error) {
            console.error('GitHub repos API error:', error);
            return [];
        }
    }
};

// LeetCode API Service
export const leetcodeService = {
    // Extract username from LeetCode URL
    extractUsername: (url) => {
        if (!url) return null;
        const match = url.match(/leetcode\.com\/u?\/([^/?]+)/);
        return match ? match[1] : null;
    },

    // Get LeetCode user stats using third-party API
    getUserStats: async (username) => {
        try {
            const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}`);
            return response.data;
        } catch (error) {
            console.error('LeetCode API error:', error);
            return null;
        }
    },

    // Get LeetCode submission calendar
    getSubmissionCalendar: async (username) => {
        try {
            const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${username}/calendar`);
            return response.data;
        } catch (error) {
            console.error('LeetCode calendar API error:', error);
            return null;
        }
    }
};

// HackerRank API Service (Limited public API)
export const hackerrankService = {
    // Extract username from HackerRank URL
    extractUsername: (url) => {
        if (!url) return null;
        const match = url.match(/hackerrank\.com\/profile\/([^/?]+)/);
        return match ? match[1] : null;
    },

    // Note: HackerRank doesn't have a public API for user profiles
    // This is a placeholder for future implementation or scraping
    getUserProfile: async (username) => {
        // This would require web scraping or a premium API
        return {
            username,
            profileUrl: `https://www.hackerrank.com/profile/${username}`,
            // Placeholder data
            note: 'HackerRank profile data requires premium API access'
        };
    }
};
