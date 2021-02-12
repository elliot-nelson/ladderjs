/*
 * Part of Ladder, a game.
 * Copyright (C) 1999, 2000 Stephen Ostermiller
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
 * A level editor for Ladder.
 */
public class Editor extends JFrame implements WindowListener{
	/**
	 * The instance of ladder that calls this.
	 */
	private Ladder parent;
	/**
	 * The text component of the editor.
	 */
	private EditorCanvas theArea;

	/**
	 * Create an editor.
	 *
	 * @param level A string representation of the current level.
	 * @param parent The instance of Ladder that called this.
	 */
	public Editor(String level, Ladder parent){
		theArea = new EditorCanvas(level);
		this.parent = parent;
		this.setLocation(50, 50);
		this.addWindowListener(this);
		this.addKeyListener(theArea);
		this.setResizable(true);
		this.setTitle("Ladder Level Editor");
		theArea.setFont(new Font("Monospaced", Font.PLAIN, 12));
		this.getContentPane().add(theArea);
		this.pack();
		this.setVisible(true);
	}

	/**
	 * Window Deiconified
	 *
	 * @param event window Deiconified
	 */
	public void windowDeiconified(java.awt.event.WindowEvent event){
	}

	/**
	 * window closed.
	 *
	 * @param event window closed.
	 */
	public void windowClosed(java.awt.event.WindowEvent event){
	}

	/**
	 * window opened.
	 *
	 * @param event window opened.
	 */
	public void windowOpened(java.awt.event.WindowEvent event){
	}

	/**
	 * window iconified.
	 *
	 * @param event window iconified.
	 */
	public void windowIconified(java.awt.event.WindowEvent event){
	}

	/**
	 * window deiconified.
	 *
	 * @param event window deiconified.
	 */
	public void windowActivated(java.awt.event.WindowEvent event){
	}

	/**
	 * window deactivated.
	 *
	 * @param event window deactivated.
	 */
	public void windowDeactivated(java.awt.event.WindowEvent event){
	}

	/**
	 * window closing.
	 *
	 * @param event window closing.
	 */
	public void windowClosing(java.awt.event.WindowEvent event){
		parent.setLevel(theArea.getLevel());
		setVisible(false);       // hide the Frame
		dispose();    // free the system resources
	}
}
