#!/bin/bash

size=`ls -lah ladder.jar | grep -oE '[0-9]+[KkMm]'`
if [ -z "`grep "$size" download.html`" ]
then
    echo "ladder.jar size is $size but download.html does not show that."
    exit 1
fi

FILES=$@
FILES=${FILES/package.html/}
FILES=${FILES/web/}
FILES=${FILES/javadoc/}
FILES=${FILES/compile/}
if [ "$FILES" ]
then
	echo Make: copying to web directory: $FILES
	cp -r $FILES ~/sites/ostermiller.org/www/ladder
fi
