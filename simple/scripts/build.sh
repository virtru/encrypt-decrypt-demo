cleanup(){
	if [ -f ./simple/js/demo-utils.js ]; then 
		rm ./simple/js/demo-utils.js; 
	fi
}

build(){
	browserify ./simple/js/tdf-browserify.js -o ./simple/js/demo-utils.js
}

cleanup && build