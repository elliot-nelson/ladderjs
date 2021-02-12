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

import java.util.*;

/**
 * This class defines a barrel.  Barrels appear as an 'o' on the screen.
 * The roll down the screen and try to crush the lad.
 */
public class Barrel extends Creature{

	/**
	 * Random Number Generator for this Barrel.
	 */
	private static Random rnum = new Random();

	/**
	 * Create a new barrel.
	 */
	public Barrel(){
		this(0,0);
	}

	/**
	 * Create a new barrel in the given position.
	 *
	 * @param xpos the x coordinate of the barrel's position
	 * @param ypos the y coordinate of the barrel's position
	 */
	public Barrel(int xpos, int ypos){
		this(xpos, ypos, Creature.STATIONARY);
	}

	/**
	 * Create a new barrel in the given position, going the proper direction
	 *
	 * @param xpos the x coordinate of the barrel's position
	 * @param ypos the y coordinate of the barrel's position
	 * @param direction the direction in which the barrel is initially moving
	 */
	public Barrel(int xpos, int ypos, int direction){
		this.xpos = xpos;
		this.ypos = ypos;
		this.direction = direction;
		symbol = 'o';
	}

	/**
	 * The command go  down.
	 */
	private static final int DOWN = 2;

	/**
	 * The command go left.
	 */
	private static final int LEFT = 4;

	/**
	 * The command go right.
	 */
	private static final int RIGHT = 6;

	/**
	 * The command stop.
	 */
	private static final int STOP = 5;

	/**
	 * Cause this barrel to update itself.  This will tell the barrel i
	 * is allowed to move.  The context around the barrel is passed to the barrel.
	 * The barrel uses this context, and its current direction to decide
	 * where it will be next.  Basically the barrel will fall down if nothing is
	 * under it, will move in the direction it was moving if it is not blocked,
	 * and will move randomly right or left if it hits some obstacle.
	 * The context is passed as 9 characters.  The characters are numbered like the
	 * number keypad for easy reference.
	 *
	 * @param one the character an the screen in the one position
	 * @param two the character an the screen in the two position
	 * @param three the character an the screen in the three position
	 * @param four the character an the screen in the four position
	 * @param five the character an the screen in the five position
	 * @param six the character an the screen in the six position
	 * @param seven the character an the screen in the seven position
	 * @param eight the character an the screen in the eight position
	 * @param nine the character an the screen in the nine position
	 */
	public void update(char one, char two, char three, char four, char five, char six,
		char seven, char eight, char nine){
		int go = Barrel.STOP;
		if (two == 'H' && five == 'H' && direction == Creature.DOWN){
			go = Barrel.DOWN;
		} else if (five == 'H' && two == 'H'){
			double num = rnum.nextDouble();
			if (num < .25){
				go = Barrel.STOP;
			} else if (num < .5){
				go = Barrel.DOWN;
			} else if (num < .75){
				go = Barrel.RIGHT;
			} else {
				go = Barrel.LEFT;
			}
		} else if (two != '=' && two != '-' && two != '|'){
			go = Barrel.DOWN;
		} else if (five == 'H'){
			double num = rnum.nextDouble();
			if (num < (double)1/3){
				go = Barrel.STOP;
			} else if (num < (double)2/3){
				go = Barrel.RIGHT;
			} else {
				go = Barrel.LEFT;
			}
		} else if (direction == Creature.LEFT){
			go = Barrel.LEFT;
			if (four == '=' || four == '-' || four == '|'){
				go = Barrel.RIGHT;
			}
		} else if (direction == Creature.RIGHT){
			go = Barrel.RIGHT;
			if (six == '=' || six == '-' || six == '|'){
				go = Barrel.LEFT;
			}
		} else {
			double num = rnum.nextDouble();
			if (num < (double)1/3){
				go = Barrel.STOP;
			} else if (num < (double)2/3){
				go = Barrel.RIGHT;
			} else {
				go = Barrel.LEFT;
			}
		}
		if (go == Barrel.RIGHT){
			if (six != '=' && six != '-' && six != '|'){
				xpos++;
				direction = Creature.RIGHT;
			}
		} else if (go == Barrel.LEFT){
			if (four != '=' && four != '-' && four != '|'){
				xpos--;
				direction = Creature.LEFT;
			}
		} else if (go == Barrel.DOWN){
			if (two != '=' && two != '-' && two != '|'){
				ypos++;
				direction = Creature.DOWN;
			}
		}
	}
}

