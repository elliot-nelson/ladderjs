/*
 * Part of Ladder, a game.
 * Copyright (C) 1999-2020
 * Stephen Ostermiller http://ostermiller.org/contact.pl?regarding=Ladder
 * Anthony Howe https://github.com/SirWumpus/Ladder
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * See COPYING.TXT for details.
 */

package com.Ostermiller.Ladder;

import java.io.*;
import java.util.*;
import java.net.URL;
import java.awt.Dimension;

/**
 * A level that can be loaded into a game of Ladder.
 */
public class Level implements Cloneable {

	/**
	 * Internally, we will represent this level as a double array of characters.
	 * The arrays should always be the same length and the last arrays should no
	 * consist of blanks lines.
	 *
	 * in level[i][j], there are i rows that start from 0 at the top of the screen
	 * and there are j columns that start from 0 at the left of the screen.
	 */
	protected char[][] level;

	/**
	 * indicates that this level has changed since the last time i
	 * was loaded or saved.
	 */
	protected boolean changed = false;

	/**
	 * Create an empty level.
	 */
	public Level(){
		level = new char[1][1];
		level[0][0] = ' ';
	}

	/**
	 * Create a level using the specified string as the level.
	 *
	 * @param level a string representing the level.
	 */
	public Level(String level){
		setLevel(level);
	}

	/**
	 * Create a level by loading it from the specified file.
	 *
	 * @param file file that contains the desired level.
	 * @exception IOException if an exception occurs reading the file.
	 */
	public Level(File file) throws java.io.IOException {
		load(file);
	}

	/**
	 * create Level which is a deep copy of the one specified
	 *
	 * @param copy the Level to be copied.
	 */
	public Level(Level copy){
		level = new char[copy.level.length][];
		for (int i=0; i<level.length; i++){
			level[i] = new char[copy.level[i].length];
			System.arraycopy(copy.level[i], 0, level[i], 0, copy.level[i].length);
		}
	}

	/**
	 * Set the character at the given row and column to the given character.
	 * Rows start from zero at the top of the screen and columns start from
	 * zero at the left of the screen.
	 *
	 * @param row the vertical coordinate of the character that should be changed.
	 * @param column the horizontal coordinate of  the character that should be changed.
	 * @param c character to which the given point should be set.
	 */
	public final void setCharAt(int row, int column, char c){
		level[row][column] = c;
	}

	/**
	 * Get the characters at the given row in the given columns.
	 * Rows start from zero at the top of the screen and columns start from
	 * zero at the left of the screen.
	 *
	 * @param row the vertical coordinate of the character that should be retrieved.
	 * @param columnStart the starting horizontal coordinate of the characters that should be retrieved.
	 * @return array of characters from the given point.
	 */
	public final char[] getCharsAt(int row, int columnStart, int length){
		char retValue[] = new char[length];
		System.arraycopy(level[row], columnStart, retValue, 0, length);
		return retValue;
	}

	/**
	 * Get the character at the given row and column.
	 * If the requested position is not available, a wall ('|') will be
	 * returned for convenience.
	 * Rows start from zero at the top of the screen and columns start from
	 * zero at the left of the screen.
	 *
	 * @param row the vertical coordinate of the character that should be retrieved.
	 * @param column the horizontal coordinate of the character that should be retrieved.
	 * @return character at the given point.
	 */
	public final char charAt(int row, int column){
		if (row < 0 || column < 0 || row >= level.length || column >= level[row].length){
			return '|';
		}
		return level[row][column];
	}

	/**
	 * Get the number of rows of text in this level.
	 *
	 * @return number of rows.
	 */
	public int getRowCount(){
		return level.length;
	}

	/**
	 * Get the number of columns of text in this level.
	 *
	 * @return number of rows.
	 */
	public int getColumnCount(){
		return level[0].length;
	}

	/**
	 * For test purposes.
	 */
	private static void main(String[] args){
		Level l = new Level();
		try {
			l.load(args[0]);
			if (l.isChanged()){
				System.out.println("It changed!");
			}
			for (int i=0; i<l.getRowCount(); i++){
				System.out.println(new String(l.getCharsAt(i,0,l.getColumnCount())));
			}
			System.out.println(l.charAt(19, 5));
		} catch (IOException e){
			System.err.println(e.getMessage());
		}
	 }

	/**
	 * Checks to see if this level changed since it was last loaded or saved.
	 * Methods that load, save, set, or get the level will
	 * reset this value.
	 *
	 * @return true if this level has changed.
	 */
	public boolean isChanged(){
		return changed;
	}

	/**
	 * Does this string contain only whitespace characters?
	 *
	 * @return true if the string is blank
	 */
	private static boolean isBlank(String s){
		for (int i=0; i<s.length(); i++){
			switch (s.charAt(i)){
				case ' ': case '\n': case '\r': case '\t': case '\f':{
				} break;
				default:{
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Write the this level to a file.
	 *
	 * @exception java.io.IOException an IOException occurs.
	 * @param fileName name of the file to which to write.
	 */
	public void store(String fileName) throws java.io.IOException{
		store(new File(fileName));
	}

	/**
	 * Write the this level to a file.
	 *
	 * @exception java.io.IOException an IOException occurs.
	 * @param file where to write.
	 */
	public void store(File file) throws java.io.IOException{
		if (file.exists()) file.delete();
		store(new FileOutputStream(file));
	}

	/**
	 * Write the this level to an OutputStream.
	 *
	 * @exception java.io.IOException an IOException occurs.
	 * @param stream where to write.
	 */
	public void store(OutputStream stream) throws java.io.IOException{
		String level = getLevel();
		stream.write(level.getBytes());
		changed = false;
	}

	/**
	 * Load the this level from a file.
	 *
	 * @exception java.io.IOException an IOException occurs.
	 * @param fileName name of the file that contains the level to load.
	 */
	public void load(String fileName) throws java.io.IOException{
		// first look in the classpath
		String classPathFileName = fileName;
		// change all but the last '.' to a '/' for the classpath loader.
		if (classPathFileName.indexOf(".") != -1){
			classPathFileName = classPathFileName.substring(0,
				classPathFileName.lastIndexOf(".")).replace('.', '/') +
				classPathFileName.substring(classPathFileName.lastIndexOf("."));
		}
		URL url = ClassLoader.getSystemResource(classPathFileName);
		if (url != null){
			InputStream stream = url.openStream();
			load(stream);
		} else {
			 load(new File(fileName));
		}
	}

	/**
	 * Load the this level from a file.
	 *
	 * @exception java.io.IOException an IOException occurs.
	 * @param file file that contains a level.
	 */
	public void load(File file) throws java.io.IOException{
		load(new FileInputStream(file));
	}

	/**
	 * Load the this level from an InputStream.
	 *
	 * @exception java.io.IOException an IOException occurs.
	 * @param stream from which to read the level.
	 */
	public void load(InputStream stream) throws java.io.IOException{
		String level;
		StringBuffer b = new StringBuffer();

		int c = stream.read();
		while (c != -1){
			b.append((char)c);
			c = stream.read();
		}
		setLevel(b.toString());
	}

	/**
	 * Set the level to the given string.
	 * The level may be neatened.  If it is changed,
	 * isNeatened will return true until it is loaded or saved.
	 *
	 * @param levelString the desired level
	 */
	public void setLevel(String levelString){
		if (levelString.equals("")){
			levelString = " ";
		}
		// find the number of lines and the length of the longest line.
		StringTokenizer st = new StringTokenizer(levelString, "\r\n", false);
		int maxLength = 0;
		int blankLines = 0; // number of blank lines since the last real line
		int numLines = 0;
		while(st.hasMoreTokens()){
			String s = st.nextToken();
			if (s.length() > maxLength){
				maxLength = s.length();
			}
			if (isBlank(s)){
				blankLines++;
			} else {
				numLines += blankLines;
				numLines++;
				blankLines = 0;
			}
		}

		level = new char[numLines][maxLength];

		// put neatened lines into the level character array
		st = new StringTokenizer(levelString, "\r\n", false);
		for (int i=0; i<numLines; i++){
			String s = st.nextToken();
			for (int j = 0; j < s.length(); j++){
				level[i][j] = s.charAt(j);
			}
			// pad the line if needed.
			Arrays.fill(level[i], s.length(), maxLength, ' ');
			changed = s.length() < maxLength;	// Did we pad line?
		}
		if (st.hasMoreTokens()){
			changed = true; // we chopped blank lines off the end.
		}
	}

	/**
	 * Get a string representing the given level.
	 * This method will reset isNeatened().
	 *
	 * @return a representation of the level.
	 */
	public String getLevel(){
		changed = false;
		StringBuffer sb = new StringBuffer(level.length *
			(level[0].length + System.getProperty("line.separator").length()));
		for (int i=0; i < level.length; i++){
			for (int j=0; j < level[i].length; j++){
				sb.append(level[i][j]);
			}
			sb.append(System.getProperty("line.separator"));
		}
		return sb.toString();
	}

	/**
	 * Get a boxed string representing the given level.
	 * The level returned will be bordered on all four
	 * sides by walls.<br>
	 * |====|
	 * |&nbsp;&nbsp;&nbsp;&nbsp;|
	 * |&nbsp;&nbsp;H&nbsp;|
	 * |&nbsp;&nbsp;H&nbsp;|
	 * |====|=<br>
	 * This method will reset isNeatened().
	 *
	 * @return a representation of the level.
	 */
	public String getPlayableLevel(){
		changed = false;
		StringBuffer sb = new StringBuffer((level.length + 2) *
			((level[0].length + 2) + System.getProperty("line.separator").length()));

		// Append the top line of equals |=========|
		sb.append('|');
		for (int i=0; i<level[0].length; i++){
			sb.append("=");
		}
		sb.append('|');
		sb.append(System.getProperty("line.separator"));

		// Append each line between walls | line |
		for (int i=0; i < level.length; i++){
			sb.append('|');
			for (int j=0; j < level[i].length; j++){
				sb.append(level[i][j]);
			}
			sb.append('|');
			sb.append(System.getProperty("line.separator"));
		}

		// Append the bottom line of equals |=========|
		sb.append('|');
		for (int i=0; i<level[0].length; i++){
			sb.append("=");
		}
		sb.append('|');
		sb.append(System.getProperty("line.separator"));
		return sb.toString();
	}

	/**
	 * Create a deep clone of this level.
	 *
	 * @return the copy of this level.
	 */
	public Object clone(){
		return new Level(this);
	}

	/**
	 * Returns a string representation of this level.
	 *
	 * @return a string representation of this level.
	 */
	public String toString(){
		return getLevel();
	}

	/**
	 * get the first position of the given character in this level.
	 *
	 * @param c the character for which to search or null if the character is not found.
	 */
	public Dimension positionOf(char c){
		for (int i=0; i<level.length; i++){
			for (int j=0; j<level[0].length; j++){
				if (level[i][j] == c) return new Dimension(j, i);
			}
		}
		return null;
	}

	/**
	 * get the next position of the given character in this level.
	 *
	 * @param c the character for which to search or null if the character is not found.
	 * @param start point at which to start searching
	 */
	public Dimension positionOf(char c, Dimension start){
		for (int j=start.width; start.height<level.length && j<level[0].length; j++){
			// finish searching the row that was already started.
			if (level[start.height][j] == c) return new Dimension(j, start.height);
		}
		for (int i=start.height+1; i<level.length; i++){
			for (int j=0; j<level[0].length; j++){
				if (level[i][j] == c) return new Dimension(j, i);
			}
		}
		return null;
	}
}
