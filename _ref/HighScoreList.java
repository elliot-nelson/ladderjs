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

import java.awt.*;
import java.awt.event.*;
import javax.swing.*;
import javax.swing.table.*;
import java.util.*;

/**
 * A high score list for the game
 */
public class HighScoreList {

	/**
	 * Internal representation of the list
	 */
	private HighScore[] highScores;

	/**
	 * The high score that was last added to this list
	 */
	private HighScore lastAdded;

	/**
	 * Create a new high score list of the default length
	 */
	public HighScoreList(){
		this(10);
	}

	/**
	 * Create a new high score list of the given length
	 *
	 * @param length desired length of the list
	 */
	public HighScoreList(int length){
		highScores = new HighScore[length];
	}

	/**
	 * Could a high score with the given score make the list?
	 *
	 * @param score will this score make the list?
	 * @return true if the list has room for the score or if the score is high enough to make the list
	 */
	public boolean canBeAdded(long score){
		return (highScores[highScores.length - 1] == null
			|| highScores[highScores.length -1].score < score);
	}

	/**
	 * Add a high score to the list.
	 * Since the high score list is of a fixed length, this
	 * method may have no effect or it may cause the lowest high
	 * score to be removed from the list.
	 *
	 * @param score the score to be added to this list.
	 */
	public void add(HighScore score){
		if (canBeAdded(score.score)){
			lastAdded = score;
			HighScore current = score;
			for (int i=0; i<highScores.length && current != null; i++){
				if (highScores[i] == null){
					highScores[i] = current;
					current = null;
				} else if (highScores[i].score < current.score) {
					HighScore temp = highScores[i];
					highScores[i] = current;
					current = temp;
				}
			}
		}
	}

	/**
	 * Store this high score list to the given properties.
	 *
	 * @param props high scores are put here
	 */
	public void store(Properties props){
		for (int i=0; i<highScores.length && highScores[i] != null; i++){
			props.setProperty("HighScore" + i + "Name", highScores[i].name);
			props.setProperty("HighScore" + i + "Score", "" + highScores[i].score);
			props.setProperty("HighScore" + i + "Level", "" + highScores[i].level);
		}
	}

	/**
	 * Load this high score list from the given properties.
	 *
	 * @param props where the high scores are loaded from
	 */
	public void load(Properties props){
		boolean foundLast = true;
		for (int i=0; i<highScores.length && foundLast; i++){
			String name = props.getProperty("HighScore" + i + "Name");
			String score = props.getProperty("HighScore" + i + "Score");
			String level = props.getProperty("HighScore" + i + "Level");
			if (name != null && score != null && level != null){
				try {
					highScores[i] = new HighScore(Long.parseLong(score, 10), Integer.parseInt(level, 10), name);
				} catch (NumberFormatException e){
					System.err.println("Error loading high scores");
					System.err.println(e.getMessage());
					foundLast = false;
				}
			} else {
				foundLast = false;
			}
		}
	}

	/**
	 * Format this HighScoreList for debug printing
	 *
	 * @return a string representation of this HighScoreList
	 */
	public String toString(){
		StringBuffer sb = new StringBuffer();
		for (int i=0; i<highScores.length && highScores[i] != null; i++){
			sb.append(highScores[i]).append('\n');
		}
		return (sb.toString());
	}

	/**
	 * Class that describes how the table of high scores should be displayed
	 */
	private class HighScoreTable extends AbstractTableModel {

		/**
		 * The names of the table columns
		 */
		private String[] columnNames = {"Name", "Score", "Level"};

		/**
		 * Get the name of the indicated column
		 *
		 * @param column the column being queried
		 * @return the name of the column
		 */
		public String getColumnName(int column) {
			return columnNames[column];
		}

		/**
		 * Get the number of columns in the table
		 *
		 * @return the number of columns
		 */
		public int getColumnCount() {
			return columnNames.length;
		}

		/**
		 * Get the number of rows in the table
		 *
		 * @return the number for rows
		 */
		public int getRowCount() {
			int i;
			for (i=0; i < highScores.length && highScores[i] != null; i++);
			return i;
		}

		/**
		 * Get the value of the indicated cell
		 *
		 * @param the row of the cell
		 * @param the column of the cell
		 * @return value of the cell.
		 */
		public Object getValueAt(int row, int col) {
			switch (col){
				case 0:{
					return highScores[row].name;
				}
				case 1:{
					return Long.valueOf(highScores[row].score);
				}
				case 2:{
					return Integer.valueOf(highScores[row].level);
				}
				default:{
					return Integer.valueOf(row*col);
				}
			}
		}

		/**
		 * Get the type of the indicated column
		 * This is makes the number columns right aligned
		 *
		 * @param c column number
		 * @return type of the indicated column
		 */
		public Class getColumnClass(int c) {
			try {
				switch (c){
					case 0:{
						return Class.forName("java.lang.String");
					}
					case 1:{
						return Class.forName("java.lang.Long");
					}
					case 2:{
						return Class.forName("java.lang.Integer");
					}
					default:{
						return Class.forName("java.lang.Object");
					}
				}
			} catch (ClassNotFoundException e){
				return null;
			}
		}
	}

	/**
	 * Show the high scores to the user in a dialog box.
	 *
	 * @param parentComponent parent of the window for the modal dialog.
	 */
	public void showHighScoreWindow(Component parentComponent){
			JTable table = new JTable(new HighScoreTable());
		for (int i =0; lastAdded != null && i<highScores.length && highScores[i] != null; i++){
			if (highScores[i] == lastAdded){
				table.changeSelection(i,0,false,false);
			}
		}

		for (int i = 0; i < table.getColumnCount(); i++) {
			TableColumn column = table.getColumnModel().getColumn(i);
			if (i == 0) {
				column.setPreferredWidth(200); //name column is bigger
			} else if (i == 1){
				column.setPreferredWidth(100); //name column is bigger
			} else {
				column.setPreferredWidth(50);
			}
		}
		JPanel panel = new JPanel(new BorderLayout());
		panel.add(table.getTableHeader(), BorderLayout.NORTH);
		panel.add(table, BorderLayout.CENTER);
		JOptionPane.showMessageDialog(parentComponent, panel, "High Scores", JOptionPane.PLAIN_MESSAGE);
		lastAdded = null;
	}
}
