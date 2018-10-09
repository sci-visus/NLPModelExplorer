# Before create the virtual enviroment, instead of using localhost, 127.0.0.1, change to 0.0.0.0

FROM python:2.7
# install all packages

RUN apt-get update
RUN apt-get install -y openjdk-8-jdk


RUN pip install numpy
RUN pip install Flask
RUN pip install python-socketio
RUN pip install nltk
RUN pip install pattern
RUN pip install eventlet
RUN pip install bson
RUN pip install torch torchvision
RUN pip install h5py
RUN pip install requests
RUN pip install ujson
RUN pip install pymongo

RUN python -m nltk.downloader punkt
RUN python -m nltk.downloader averaged_perceptron_tagger


# Set the working dirctory to /app
WORKDIR /app

# Copy the current directory contents into the container at /app
ADD . /app

EXPOSE 5050

# Run 
CMD python NLIexampleVis.py
