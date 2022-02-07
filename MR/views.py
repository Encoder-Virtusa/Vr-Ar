from multiprocessing import context
from django.shortcuts import render
from django.http import HttpResponse


def login(request):
    context={}
    return render(request, 'chat/login.html', context)
