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
 * The basic creature class.
 *
 * @see Barrel
 * @see Lad
 */
public abstract class Creature{
	/**
	 * The x position of this creature.
	 *
	 */
	protected int xpos;
	/**
	 * The y position of this creature.
	 *
	 */
	protected int ypos;
	/**
	 * The direction in which this creature is moving.
	 *
	 */
	protected int direction;
	/**
	 * The direction up.
	 *
	 */
	public static final int UP = 8;
	/**
	 * The direction down.
	 *
	 */
	public static final int DOWN = 2;
	/**
	 * The direction right.
	 *
	 */
	public static final int RIGHT = 6;
	/**
	 * The direction left.
	 *
	 */
	public static final int LEFT = 4;
	/**
	 * The direction up and left.
	 *
	 */
	public static final int UPLEFT = 7;
	/**
	 * The direction up and right.
	 *
	 */
	public static final int UPRIGHT = 9;
	/**
	 * The direction down and left.
	 *
	 */
	public static final int DOWNLEFT = 1;
	/**
	 * The direction down and right.
	 *
	 */
	public static final int DOWNRIGHT = 3;
	/**
	 * No Direction.
	 *
	 */
	public static final int STATIONARY = 5;
	/**
	 * The character that should be displayed to represent this creature in the game.
	 *
	 */
	protected char symbol;

	/**
	 * Create a creature.
	 *
	 * @param xpos The x position of this creature.
	 * @param ypos The y position of this creature.
	 * @param direction The direction in which this creature is moving.
	 */
	public void Creature(int xpos, int ypos, int direction){
		this.xpos = xpos;
		this.ypos = ypos;
		this.direction = direction;
	}

	/**
	 * Get the character that should be displayed to represent this creature in the game.
	 *
	 * @return The character that should be displayed to represent this
	 *     creature in the game.
	 */
	public char getSymbol(){
		return symbol;
	}

	/**
	 * Get the x position of this creature.
	 *
	 * @return The x position of this creature.
	 */
	public int getXPos(){
		return xpos;
	}

	/**
	 * Get the y position of this creature.
	 *
	 * @return The y position of this creature.
	 */
	public int getYPos(){
		return ypos;
	}

	/**
	 * Set the x position of this creature.
	 *
	 * @param xpos The x position of this creature.
	 */
	public void setXPos(int xpos){
		this.xpos = xpos;
	}

	/**
	 * Set the y position of this creature.
	 *
	 * @param ypos The y position of this creature.
	 */
	public void setYPos(int ypos){
		this.ypos = ypos;
	}

	/**
	 * Get the direction in which this creature is moving.
	 * The result should be: UP, DOWN, RIGHT, LEFT, UPLEFT,
	 * UPRIGHT, DOWNLEFT, DOWNRIGHT, or STATIONARY
	 *
	 * @return The direction in which this creature is moving.
	 */
	public int getDirection(){
		return direction;
	}

	/**
	 * Request that this creature updates itself.
	 * This should be called once per frame of the game.
	 *
	 * @param one The character DOWNLEFT of this creature.
	 * @param two The character DOWN of this creature.
	 * @param three The character DOWNRIGHT of this creature.
	 * @param four The character LEFT of this creature.
	 * @param five The character on this creature.
	 * @param six The character RIGHT of this creature.
	 * @param seven The character UPLEFT of this creature.
	 * @param eight The character UP of this creature.
	 * @param nine The character UPRIGHT of this creature.
	 */
	public abstract void update(char one, char two, char three, char four, char five, char six,
		char seven, char eight, char nine);

	/**
	 * Is this creature is the same  as the given creature.
	 *
	 * @param c Creature to compare this creature to.
	 * @return True if the same, false otherwise.
	 */
	public boolean equals(Creature c){
		if (c.getXPos() == xpos && c.getYPos() == ypos){
			return (true);
		} else {
			return (false);
		}
	}

	/**
	 * Return a string representation of this creature.
	 *
	 * @return A string representation of this creature.
	 */
	public String toString(){
		return ("" + xpos + "," +ypos);
	}

	/**
	 * Get a hash code for this creature.
	 *
	 * @return A hash code of this creature.
	 */
	public int hashCode(){
		return (toString().hashCode());
	}
}
