import axios from 'axios';

const BASE_URL = 'https://quyendz.pythonanywhere.com/';

export const endpoints = {
    'categories': '/categories/',
    'locations': '/locations/',
    'jobs': (params) => `/jobs/${params ? '?' + params : ''}`,
    'job-detail': (jobId) => `/jobs/${jobId}/`,
    'job-compare': `/jobs/compare/`,
    'login': '/o/token/',
    'current-user': '/users/current-user/',
    'register-applicant': '/users/register/applicant/',
    'register-recruiter': '/users/register/recruiter/',

    'apply-job': '/applications/apply/',
    'my-applications': '/applications/',
    'evaluate-application': (appId) => `/applications/${appId}/evaluate/`,

    'recruiter-jobs': '/recruiter/jobs/',
    'recruiter-job-detail': (jobId) => `/recruiter/jobs/${jobId}/`,
    'recruiter-stats': '/recruiter/jobs/stats/',

    'payment-history': '/payment/history/',
    'create-payment': '/payment/momo-pay/',

    'packages': '/packages/',
    'package-detail': (pkgId) => `/packages/${pkgId}/`
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