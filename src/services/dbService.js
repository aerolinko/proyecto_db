class dbService {
    getCourses() {
        return axios.get(API_URL);
    }

    getCourseById(id) {
        return axios.get(`${API_URL}/${id}`);
    }

    getCourseByAuthorId(author_id) {
        return axios.get(`${API_URL}/author/${author_id}`);
    }

    getCoursesByNotAuthorId(author_id) {
        return axios.get(`${API_URL}/not/author/${author_id}`);
    }

    saveCourse(course) {
        return axios.post(API_URL, course);
    }

    updateCourse(id, course) {
        return axios.put(`${API_URL}/${id}`, course);
    }

    deleteCourse(id) {
        return axios.delete(`${API_URL}/${id}`);
    }

    deleteAllCourses(id) {
        return axios.delete(`${API_URL}/all/${id}`);
    }
}

export default new CourseService();