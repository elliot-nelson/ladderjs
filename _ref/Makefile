JFLAGS=-classpath ../../..
JAVA=java $(JFLAGS)
JAVAC=javac $(JFLAGS)
JAVADOC=javadoc $(JFLAGS)
BTE=bte
CVS=cvs

.SUFFIXES:
.SUFFIXES: .java .class
.SUFFIXES: .bte .html

.PHONY: all
all: junkclean spell neaten compile web javadoc build


spell: *.bte *.java
	@echo Make: Running spell check.
	@./spell.sh $?
	@touch spell

neaten: *.java
	@./neaten.sh $?
	@touch neaten

.PHONY : compile
compile: classes

JAVAFILES=$(wildcard *.java)
.PHONY: classes
classes: $(JAVAFILES:.java=.class)
	@# Write a bash script that will compile the files in the todo list
	@echo "#!/bin/bash" > tempCommand
	@# If the todo list doesn't exist, don't compile anything
	@echo "if [ -e tempChangedJavaFileList ]" >> tempCommand
	@echo "then" >> tempCommand
	@# Make sure each file is only on the todo list once.
	@echo "sort tempChangedJavaFileList | uniq  > tempChangedJavaFileListUniq" >> tempCommand
	@echo "FILES=\`cat tempChangedJavaFileListUniq\`" >> tempCommand
	@# Compile the files.
	@echo "echo Make: Compiling: $$ FILES" >> tempCommand
	@echo "$(JAVAC) $$ FILES" >> tempCommand
	@echo "fi" >> tempCommand
	@# Remove extra spaces in the script that follow the dollar signs.
	@sed "s/\$$ /\$$/" tempCommand > tempCommand.sh
	@# Make the script executable.
	@chmod +x tempCommand.sh
	@# Call the script
	@./tempCommand.sh
	@rm -f tempCommand tempCommand.sh tempChangedJavaFileList tempChangedJavaFileListUniq

.java.class:
	@#for each changed java file, add it to the todo list.
	@echo "$<" >> tempChangedJavaFileList

.PHONY: junkclean
junkclean:
	@echo Make: Removing Ladder detritus.
	@rm -rf *~ ~* core *.bak com/ docs/

.PHONY: buildclean
buildclean: junkclean
	@echo Make: Removing ladder.jar.
	@rm -f ladder.jar

.PHONY: javadocclean
javadocclean: junkclean
	@echo Make: Removing generated JavaDoc.
	@rm -rf doc/

.PHONY: clean
clean: buildclean javadocclean webclean
	@echo Make: Removing generated class files.
	@rm -f *.class spell javadoc release neaten

ladder.jar: Makefile *.bte *.java *.class *.sh *.lvl *.mf *.ini *.dict *.css
	@echo Make: Building jar file.
	@rm -f *~
	@rm -f ladder.jar
	@rm -rf com/
	@mkdir -p com/Ostermiller/Ladder
	@cp Makefile *.bte *.java *.class *.sh *.lvl *.mf *.ini *.dict *.css com/Ostermiller/Ladder/
	@jar cmfv Ladder.mf ladder.jar com/ > /dev/null
	@rm -rf com/

.PHONY: build
build: ladder.jar

javadoc: *.java
	@echo Make: Generating JavaDoc.
	@rm -rf doc/
	@mkdir doc
	@$(JAVADOC) -quiet -d doc/ com.Ostermiller.Ladder > /dev/null
	@touch javadoc

.PHONY: htmlclean
htmlclean:
	@echo Make: Removing generated html documents.
	@rm -f `find . -name "*.bte" | sed s/.bte/.html/`

NOOUTPUTBTE=(downloadPage|form|levelPage|page)
BTEFILES=$(wildcard *.bte)
.PHONY: html
html: $(BTEFILES:.bte=.html)
	@# Write a bash script that will compile the files in the todo list
	@echo "#!/bin/bash" > tempCommand
	@# If the todo list doesn't exist, don't compile anything
	@echo "if [ -e tempChangedBTEFileList ]" >> tempCommand
	@echo "then" >> tempCommand
	@# Make sure each file is only on the todo list once.
	@echo "sort tempChangedBTEFileList | uniq | egrep -v \"$(NOOUTPUTBTE)\" > tempChangedBTEFileListUniq" >> tempCommand
	@echo "FILES=\`cat tempChangedBTEFileListUniq\`" >> tempCommand
	@echo "if [ \"$$ FILES\" ]" >> tempCommand
	@echo "then" >> tempCommand
	@# Compile the files.
	@echo "echo Make: Compiling: $$ FILES" >> tempCommand
	@echo "$(BTE) $$ FILES" >> tempCommand
	@echo "fi" >> tempCommand
	@echo "fi" >> tempCommand
	@# Remove extra spaces in the script that follow the dollar signs.
	@sed "s/\$$ /\$$/" tempCommand > tempCommand.sh
	@# Make the script executable.
	@chmod +x tempCommand.sh
	@# Call the script
	@./tempCommand.sh
	@rm -f tempCommand tempCommand.sh tempChangedBTEFileList tempChangedBTEFileListUniq

.bte.html:
	@#for each changed java file, add it to the todo list.
	@echo "$<" >> tempChangedBTEFileList

.PHONY: web
web: html

.PHONY: webclean
webclean: htmlclean

.PHONY: *.class
*.class:

.PHONY: update
update: clean
	$(CVS) update

.PHONY: commit
commit: clean
	$(CVS) commit

release: *.html ladder.jar *.css form.bte levelPage.bte page.bte
	@./release.sh $?
	@touch release
