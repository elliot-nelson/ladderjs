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

/**
 * A high score for the game
 */
public class HighScore {

	/**
	 * The actual score associated with this high score.
	 */
	public long score = 0;

	/**
	 * The level number on which the game ended.
	 */
	public int level = 0;

	/**
	 * The name of the person who achieved this high score.
	 */
	public String name = "";

	/**
	 * Create a new high score.
	 */
	public HighScore(){
	}

	/**
	 * Create a new high score.
	 *
	 * @param score the actual score associated with this high score.
	 * @param level the level number on which the game ended.
	 * @param name the name of the person who achieved this high score.
	 */
	public HighScore(long score, int level, String name){
		this.score = score;
		this.level = level;
		this.name = name;
	}

	/**
	 * Format this HighScore for debug printing
	 *
	 * @return a string representation of this HighScore
	 */
	public String toString(){
		return (name + " Score:" + score + " Level:" + level);
	}
}
