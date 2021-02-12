#!/bin/bash

tablist=""

files=$@

for file in $files
do
    generated='0'
    if [ ! -e $file ]
    then
        echo "$file does not exists."
    elif [ -e ${file%.java}.lex ]
    then
        generated='1'
    elif [ `egrep -l "[ 	]+$" $file` ]
    then
        echo "Removing trailing white space from $file."
        mv "$file" temp
        sed 's/[ 	]*$//' temp > "$file"
    fi
    if [ $generated -eq '0' ]
    then
        tablist="$tablist $file"
    fi
done
if [ "$tablist" != "" ]
then
	tabfix -tv -w 4 $tablist
fi

