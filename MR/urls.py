from django.urls import path
from .views import *

urlpatterns =[
    path('login',login,name='login'),
    path('home',home,name='home'),
    path('tour',tour,name='tour'),
    path('about',about,name='about'),

]