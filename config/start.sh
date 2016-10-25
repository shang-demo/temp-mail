#!/bin/bash

function startServer {
	node-dev app/app.js
}

function startGulp {
#	reniceNode &
	gulp dev
}

function reniceNode {
	sleep 1
	ps -a | grep node | sed "s/ *\([0-9]\{1,\}\) .*/\1/g"  | xargs renice -19
}

startServer &

until startGulp; do
    echo "startGulp exit code $?.  ReStart.." >&2
    sleep 1
done