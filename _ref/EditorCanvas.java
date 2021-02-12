/*
 * Part of Ladder, a game.
 * Copyright (C) 1999-2005 Stephen Ostermiller
 * http://ostermiller.org/contact.pl?regarding=Ladder
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

import java.awt.event.*;
import java.util.*;
import java.awt.*;
import javax.swing.*;
import javax.swing.event.*;

/**
 * The text component of the Ladder Editor
 *
 */
public class EditorCanvas extends JPanel implements KeyListener, MouseListener{
	/**
	 * The minimum size of this component.
	 *
	 */
	private Dimension minSize;
	/**
	 * The number columns in this editorcanvas
	 *
	 */
	private int columns;
	/**
	 * the number of rows in this Editor Canvas.
	 *
	 */
	private int rows;
	/**  */
	private int cursorX, cursorY, cursorEndX, cursorEndY;
	/**
	 * A stringbuffer representing the level we are editing.
	 *
	 */
	private StringBuffer levelData;
	/**
	 * A string representing the level we are editing.
	 *
	 */
	private String level;
	/**      */
	private int letterWidth, letterHeight, letterAcsent;
	/**
	 * The size of the font to use in this EditorCanvas
	 *
	 */
	private int fontSize;
	/**
	 * The font to use in this EditorCanvas
	 *
	 */
	private Font font;
	/**
	 * On the next redraw, should we repaint this entire canvas?
	 *
	 */
	private boolean repaintAll;
	/**      */
	private Color bgColor, fgColor;

	/**
	 * Create a new EditorCanvas
	 *
	 * @param level A string representing the level to edit.
	 */
	public EditorCanvas(String level){
		bgColor = Color.white;
		fgColor = Color.black;
		StringTokenizer tok = new StringTokenizer(level, "\n");
		rows = tok.countTokens();
		String s = tok.nextToken();
		columns = s.length();
		//rows = 1;
		//while (tok.hasMoreTokens()){
		//    rows ++;
		//    tok.nextToken();
		//}
		cursorX = 1;
		cursorY = 1;
		cursorEndX = 20;
		cursorEndY = 10;
		setBackground(bgColor);
		setFontSize(12);
		levelData = new StringBuffer();
		setLevel(level);
		this.addKeyListener(this);
		this.addMouseListener(this);
	}

	/**
	 * set the font size
	 *
	 * @param size the size of the font
	 */
	public void setFontSize(int size){
		font = new Font("Monospaced", Font.PLAIN, size);
		FontMetrics fontMetrics = this.getFontMetrics(font);
		letterWidth = fontMetrics.charWidth('m');
		letterHeight = fontMetrics.getHeight();
		letterAcsent = fontMetrics.getAscent();
		minSize = new Dimension(letterWidth*(columns - 2), letterHeight*(rows - 2));
		fontSize = size;
	}

	/**
	 * get the font size
	 *
	 * @return the size of the current fond
	 */
	public int getFontSize(){
		 return fontSize;
	}

	/**
	 * set the background color
	 *
	 * @param bg The desired color of the background
	 */
	public void setBGColor(Color bg){
		bgColor = bg;
		setBackground(bgColor);
		repaintAll = true;
		repaint();
	}

	/**
	 * Set the foreground color
	 *
	 * @param fg the desired foreground color.
	 */
	public void setFGColor(Color fg){
		fgColor = fg;
		repaintAll = true;
		repaint();
	}

	/**
	 * change the level that we are editing and repaint the canvas.
	 *
	 * @param level the new level we are editing.
	 */
	private void setLevelPaint(String level){
		setLevel(level);
		repaintAll = true;
		repaint();
	}

	/**
	 * get the contents of the level we are editing
	 *
	 * @return the level we are editing
	 */
	public String getLevel(){
		StringBuffer sb = new StringBuffer(levelData.length() + rows);
		for (int i=0; i<rows; i++){
			sb.append(levelData.substring(i*columns, (i+1)*columns-1)).append('\n');
		}
		return(sb.toString());
	}

	/**
	 * set the level that we are editing, does not repaint.
	 *
	 * @param level the contents of the level to edit.
	 */
	public void setLevel(String level){
		this.level = level;
		StringTokenizer levelTok = new StringTokenizer(level, "\n");
		StringBuffer levelLine = new StringBuffer();
		levelData.setLength(0);
		levelLine.setLength(0);
		if (levelTok.hasMoreTokens()){
			levelLine.append(levelTok.nextToken());
		} else {
			levelLine.append(" ");// make room for the lad if an empty string is given
		}
		columns = levelLine.length();
		//for (int i=0; i < columns; i++){
		//    levelData.append('=');
		//}
		levelData.append(levelLine);
		int i = 1;
		while (levelTok.hasMoreTokens()){
			i++;
			levelLine.setLength(0);
			levelLine.append(levelTok.nextToken());
			// ensure that each line is the same size
			if (levelLine.length() > columns){
				levelLine.setLength(columns);
			}
			if (levelLine.length() < columns){
				for (int j = levelLine.length(); j<columns; j++){
					levelLine.append(' ');
				}
			}
			levelData.append(levelLine);
			//System.out.println(levelLine.toString());
		}
		rows = i;
		//for (int j=0; j < columns; j++){
		//    levelData.append('=');
		//}
		minSize = new Dimension(letterWidth*(columns), letterHeight*(rows));
	}

	/**
	 * gets the preferred size of this canvas.
	 *
	 * @return the preferred size of this canvas.
	 */
	public Dimension getPreferredSize() {
		return getMinimumSize();
	}

	/**
	 * get the minimum size of this component
	 *
	 * @return the minimum size of this component.
	 */
	public synchronized Dimension getMinimumSize() {
		return minSize;
	}

	/**
	 * paint this component
	 *
	 * @param g graphics object
	 */
	public void paintComponent(Graphics g){
		//System.out.println("painting Editor");
		g.setFont(font);
		g.setColor(fgColor);
		//System.out.println(g.getClipBounds().toString());
		int a = (int)Math.floor((double)g.getClipBounds().y/letterHeight);
		int b = (int)Math.ceil((double)(g.getClipBounds().y + g.getClipBounds().height + letterHeight - letterAcsent)/letterHeight + 1);
		int c = (int)Math.floor((double)g.getClipBounds().x/letterWidth);
		int d = (int)Math.ceil((double)(g.getClipBounds().x + g.getClipBounds().width + letterWidth)/letterWidth);
		//System.out.println("Vertical: " + (a+1) + " to " + (b) + " Horizontal: " + (c+1) + " to " + (d));
		for (int i=a; i<b && i<rows; i++){
			 for(int j=c; j<d && j<columns; j++){
			if (inSelection(j, i)){
				g.setColor(fgColor);
			} else {
				 g.setColor(bgColor);
			}
			g.fillRect((j)*letterWidth, (i)*letterHeight, letterWidth, letterHeight);
			if (inSelection(j, i)){
				g.setColor(bgColor);
			} else {
				 g.setColor(fgColor);
			}
			 char[] ch = new char[1];
					ch[0] = levelData.charAt(i*columns + j);
					g.drawChars(ch,0,1,(j)*letterWidth,(i)*letterHeight+letterAcsent);
			 }
		}
		repaintAll = true;
	}

	/**
	 * is the given point in the selected are of text
	 *
	 * @param x x coordinate of point to test
	 * @param y y coordinate of point to test
	 * @return true if its in, false otherwise.
	 */
	private boolean inSelection(int x, int y){
		boolean xYes = false;
		boolean yYes = false;
		if ((x>=cursorX && x<=cursorEndX) || (x>=cursorEndX && x<=cursorX)){
			xYes = true;
		}
		if ((y>=cursorY && y<=cursorEndY) || (y>=cursorEndY && y<=cursorY)){
			yYes = true;
		}
		return (xYes && yYes);
	}

	/**
	 * Repaints as single character
	 *
	 * @param xpos x position of character to paint.
	 * @param ypos y position of character to paint.
	 */
	private void repaintCharAt(int xpos, int ypos){
		repaint((xpos)*letterWidth, (ypos)*letterHeight, letterWidth,letterHeight);
	}

	/**
	 * Repaints a region of characters.
	 *
	 * @param xpos x position of character in one corner of region to
	 *     repaint
	 * @param ypos y position of character in one corner of region to
	 *     re-pain
	 * @param xpos2 x position of character in opposite corner of region to
	 *      re-pain
	 * @param ypos2 y position of character in opposite corner of region to
	 *      re-pain
	 */
	private void repaintRegion(int xpos, int ypos, int xpos2, int ypos2){
		int x, y, width, height;
		x = Math.min(xpos, xpos2);
		y = Math.min(ypos, ypos2);
		width = Math.abs(xpos2-xpos) + 1;
		height = Math.abs(ypos2-ypos) +1;
		repaint(x * letterWidth, y * letterHeight, width * letterWidth, height * letterHeight);
	}

	/**
	 * alert this editor canvas that a key was pressed.
	 *
	 * @param ke the key pressed
	 */
	public void keyPressed(KeyEvent ke){
		int keycode = ke.getKeyCode();
		switch (keycode){
		case KeyEvent.VK_LEFT:
		case KeyEvent.VK_KP_LEFT:
			if (cursorX > 0){
				repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
				cursorX--;
				cursorEndX = cursorX;
				cursorEndY = cursorY;
				repaintCharAt(cursorX, cursorY);
			}
		break;
		case KeyEvent.VK_RIGHT:
		case KeyEvent.VK_KP_RIGHT:
			if (cursorX < columns - 1){
				repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
				cursorX++;
				cursorEndX = cursorX;
				cursorEndY = cursorY;
				repaintCharAt(cursorX, cursorY);
			}
		break;
		case KeyEvent.VK_DOWN:
		case KeyEvent.VK_KP_DOWN:
			if (cursorY < rows - 1){
				repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
				cursorY++;
				cursorEndX = cursorX;
				cursorEndY = cursorY;
				repaintCharAt(cursorX, cursorY);
			}
		break;
		case KeyEvent.VK_UP:
		case KeyEvent.VK_KP_UP:
			 if (cursorY > 0){
				 repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
				 cursorY--;
				 cursorEndX = cursorX;
				 cursorEndY = cursorY;
				 repaintCharAt(cursorX, cursorY);
			}
		break;
		case KeyEvent.VK_BACK_SPACE:
			//System.out.println("Backspace!!!!");
			levelData.setCharAt(cursorY*columns + cursorX, ' ');
			repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
			if (cursorX > 0){
				cursorX--;
			} else if (cursorY > 0){
				cursorY--;
				cursorX = columns - 1;
			}
			cursorEndX = cursorX;
			cursorEndY = cursorY;
			repaintCharAt(cursorX, cursorY);
		break;
		case KeyEvent.VK_DELETE:
			repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
			levelData.setCharAt(cursorY*columns + cursorX, ' ');
			cursorEndX = cursorX;
			cursorEndY = cursorY;
			repaintCharAt(cursorX, cursorY);
		break;
		}
		//System.out.println((int)ke.getKeyChar());
		if (ke.getKeyChar() >= 32 && ke.getKeyChar() <= 126){
			levelData.setCharAt(cursorY*columns + cursorX, ke.getKeyChar());
			repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
			if (cursorX < columns){
				cursorX++;
			} else if (cursorY < rows){
				cursorY++;
				cursorX = 0;
			}
			cursorEndX = cursorX;
			cursorEndY = cursorY;
			repaintCharAt(cursorX, cursorY);
		}
	}

	/**
	 * Alert this editor that a key was released.
	 *
	 * @param ke key released.
	 */
	public void keyReleased(KeyEvent ke){
	}

	/**
	 * Alert this editor that a key was released.
	 *
	 * @param ke key released.
	 */
	public void keyTyped(KeyEvent ke){
	}

	/**
	 * alert this editor that the mouse was clicked.
	 *
	 * @param e mouse click.
	 */
	public void mouseClicked(MouseEvent e){
	}

	/**
	 * alert this editor that the mouse entered the area.
	 *
	 * @param e mouse even
	 */
	public void mouseEntered(MouseEvent e){
	}

	/**
	 * alert this editor that the mouse exited.
	 *
	 * @param e mouse exit.
	 */
	public void mouseExited(MouseEvent e){
	}

	/**
	 * alert this editor that the mouse was pressed.
	 *
	 * @param e mouse press.
	 */
	public void mousePressed(MouseEvent e){
		int mouseX, mouseY;
		mouseX = e.getX();
		mouseY = e.getY();
		repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
		cursorX = (int)Math.floor((double)mouseX/letterWidth);
		cursorY = (int)Math.floor ((double)mouseY/letterHeight);
		cursorEndX = cursorX;
		cursorEndY = cursorY;
		repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
	}

	/**
	 * alert this editor that the mouse was released.
	 *
	 * @param e mouse release.
	 */
	public void mouseReleased(MouseEvent e){
		int mouseX, mouseY;
		mouseX = e.getX();
		mouseY = e.getY();
		repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
		cursorEndX = (int)Math.floor((double)mouseX/letterWidth);
		cursorEndY = (int)Math.floor ((double)mouseY/letterHeight);
		repaintRegion(cursorX, cursorY, cursorEndX, cursorEndY);
	}
}
