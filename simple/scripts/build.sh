cleanup(){
	if [ -f ./simple/js/tdf3.js ]; then 
		rm ./simple/js/tdf3.js; 
	fi
}

build(){
	cd ./tmp; cd $VTDF3JS_DIR; 

	env="$env" npm run build

	virtruFileExt=""
	if [ "$env" != "production" ]
	then
		virtruFileExt=".develop"
	fi
	echo $env
	echo $virtruFileExt

	cp "dist/virtru-tdf3-js${virtruFileExt}.min.js" ../../simple/js
	cd ../../
	browserify ./simple/js/tdf-browserify.js -o ./simple/js/tdf3.js
}

cleanup && build