import os
from pathlib import Path
import pymysql

# 1. Cấu hình Proxy (Bắt buộc cho PythonAnywhere Free)
os.environ['http_proxy'] = "http://proxy.server:3128"
os.environ['https_proxy'] = "http://proxy.server:3128"

# 2. Database Driver
pymysql.version_info = (1, 4, 3, "final", 0)
pymysql.install_as_MySQLdb()

# Build paths
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings
SECRET_KEY = 'django-insecure-%1cnm53y!vq)6)82v&a6%4)x)$2rt+udrle927*bz6+r(q4q8!'
DEBUG = True
ALLOWED_HOSTS = ['quyendz.pythonanywhere.com', '127.0.0.1', 'localhost']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core.apps.CoreConfig',
    'users.apps.UsersConfig',
    'ckeditor',
    'ckeditor_uploader',
    'rest_framework',
    'drf_yasg',
    'oauth2_provider',
    'cloudinary',
    'cloudinary_storage',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'jobhunter.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'jobhunter.wsgi.application'

# Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'quyendz$johunterdb',
        'USER': 'quyendz',
        'PASSWORD': 'quyen03032005',
        'HOST': 'quyendz.mysql.pythonanywhere-services.com',
        'PORT': '3306',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'static')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'users/static/')

# Upload Settings
CKEDITOR_UPLOAD_PATH = "ckeditor/images/"

# Cloudinary
import cloudinary
import cloudinary.uploader
import cloudinary.api

cloudinary.config(
    cloud_name="dqbheiddg",
    api_key="434142617659482",
    api_secret="PIm-pf4A7oFGj0WO4Eu8oCuDtW8",
    secure=True,
    api_proxy="http://proxy.server:3128"
)

CLOUDINARY_STORAGE = {
    'CLOUD_NAME': 'dqbheiddg',
    'API_KEY': '434142617659482',
    'API_SECRET': 'PIm-pf4A7oFGj0WO4Eu8oCuDtW8',
    'API_PROXY': 'http://proxy.server:3128',
    'SECURE': True,
}

DEFAULT_FILE_STORAGE = 'cloudinary_storage.storage.MediaCloudinaryStorage'

# Auth & API
AUTH_USER_MODEL = "users.User"
INTERNAL_IPS = ["127.0.0.1"]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
    ),
    'DATETIME_FORMAT': "%d-%m-%Y %H:%M:%S",
}

OAUTH2_PROVIDER = {
    'ACCESS_TOKEN_EXPIRE_SECONDS': 2592000,
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

MOMO_CONFIG = {
    'endpoint': 'https://test-payment.momo.vn/v2/gateway/api/create',
    'partner_code': 'MOMO',
    'access_key': 'F8BBA842ECF85',
    'secret_key': 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    'redirect_url': 'http://localhost:3000/payment-result',
    'ipn_url': 'https://quyendz.pythonanywhere.com/api/payment/momo-ipn/'
}