cleanup(){
	if [ -f ./simple/js/tdf3.js ]; then 
		rm ./simple/js/tdf3.js; 
	fi
}

build(){
	curl https://sdk.virtru.com/js/0.3.7/virtru-sdk.min.js --output ./simple/js/virtru-tdf3-js.min.js
	browserify ./simple/js/tdf-browserify.js -o ./simple/js/tdf3.js
}

cleanup && build