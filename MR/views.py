from multiprocessing import context
from django.shortcuts import render
from django.http import HttpResponse


def login(request):
    context={}
    return render(request, 'chat/login.html', context)

def home(request):
    context = {}
    return render(request, 'page/home.html', context)

def tour(request):
    context = {}
    return render(request, 'page/tour.html', context)

def about(request):
    context = {}
    return render(request, 'page/about.html', context)