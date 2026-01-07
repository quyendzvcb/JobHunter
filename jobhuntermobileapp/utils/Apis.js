import axios from 'axios';

const BASE_URL = 'https://quyendz.pythonanywhere.com/';

export const endpoints = {
    'categories': '/categories/',
    'locations': '/locations/',
    'jobs': (params) => `/jobs/${params ? '?' + params : ''}`,
    'job-detail': (jobId) => `/jobs/${jobId}/`,
    'job-compare': (ids) => `/jobs/compare/?ids=${ids}`,
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'register-applicant': '/users/register/applicant/',
    'register-recruiter': '/users/register/recruiter/',

    // Application
    'apply-job': '/applications/apply/',
    'my-applications': '/applications/',
    'evaluate-application': (appId) => `/applications/${appId}/evaluate/`,

    // Recruiter specific (Thêm mới)
    'recruiter-jobs': '/recruiter/jobs/',
    'recruiter-job-detail': (jobId) => `/recruiter/jobs/${jobId}/`,
    'recruiter-stats': '/recruiter/jobs/stats/',

    // Payment (Nếu làm chức năng thanh toán)
    'payment-history': '/payment/history/',
    'create-payment': '/payment/create-transaction/',
    'packages': '/packages/',
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