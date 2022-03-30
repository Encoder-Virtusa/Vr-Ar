from multiprocessing import context
from django.shortcuts import render
from django.http import HttpResponse
from json import dumps

def login(request):
   
    context={}
    return render(request, 'page/login.html', context)

def home(request):
    context = {}
    return render(request, 'page/home.html', context)

def tour(request):
    context = {}
    return render(request, 'page/tour.html', context)

def about(request):
    
    context = {}
    return render(request, 'page/about.html', context)


def vr(request):
    name = request.POST['userName'];
    print(name)
    dataJson = dumps({'name':name})
    context = {'Username':dataJson}
    return render(request, 'library_last.html', context)

def chat(request):
    name = request.POST['userName'];
    print(name)
    dataJson = dumps({'name':name})
    context = {'Username':dataJson}
    return render(request, 'chat/chat.html', context)