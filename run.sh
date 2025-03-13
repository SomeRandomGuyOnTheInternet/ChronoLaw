#!/bin/bash

# cd "./src/llm-service"
# sh ./run.sh &

# cd "../nougat-service"
# source .venv/bin/activate
# python app.py &

# Run backend-service
pushd "src/backend-service" || exit
source .venv/bin/activate
python app.py &
popd || exit

# Run frontend-service
pushd "src/frontend-service" || exit
npm run start &
popd || exit

# Wait for all processes
wait
