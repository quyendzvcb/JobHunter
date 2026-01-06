import axios from 'axios';

const BASE_URL = 'https://quyendz.pythonanywhere.com/';

export const endpoints = {
    'categories': '/categories/',
    'locations': '/locations/',
    'jobs': '/jobs/',
    'job_detail': (jobId) => `/jobs/${jobId}/`,
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'register-applicant': '/users/register/applicant/',
    'register-recruiter': '/users/register/recruiter/',
    'apply-job': '/applications/apply/',
    'my-applications': '/applications/',
};

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
};

export default axios.create({
    baseURL: BASE_URL
});