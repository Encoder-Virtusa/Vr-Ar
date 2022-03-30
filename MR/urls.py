from django.urls import path
from .views import *

urlpatterns =[
    path('login',login,name='login'),
    path('',home,name='home'),
    path('chat',chat, name='chat'),
    path('tour',tour,name='tour'),
    path('vr',vr,name='vr'),
    path('about/',about,name='about'),

]