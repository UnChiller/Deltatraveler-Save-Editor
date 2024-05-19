cd src
rm -r node_modules
rm package.json package-lock.json
echo "{}" > package.json
npm install --save-dev react react-dom 
npm install --save-dev @types/react @types/react-dom
sudo npm install -g vite
cd ..