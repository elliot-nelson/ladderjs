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

import java.util.*;

/**
 * A BarrelProducer is usually represented as a V on the screen.
 * It sends out the barrels which then are behave according to the rules of the
 * barrel.  The barrel producer then recycles the barrel when it is destroyed.
 * It maintains a list of barrels and sends them out randomly.
 */
public class BarrelProducer{
	/**
	 * A vector of barrels that is shared across all instances of this class.
	 * If a certain barrel producer needs a barrel and there is one in the
	 * vector, it can take one.  If it has an extra it can leave one.
	 */
	private static Vector<Barrel> allBarrels = new Vector<Barrel>();

	/**
	 * The random number producer for this class
	 */
	private static Random rnum = new Random();

	/**
	 * The list of barrels available for use.
	 * This list is kept so that we don't have to continually create new
	 * instances of barrels, which would slow the application down due to
	 * excessive garbage collection.
	 */
	private Vector<Barrel> barrels = new Vector<Barrel>();

	/**
	 * The x coordinate of this barrel producer
	 */
	protected int xpos;

	/**
	 * The y coordinate of this barrel producer
	 */
	protected int ypos;

	/**
	 * The maximum number of barrels available to be outputted by this BarrelProducer.
	 * After this number is reached, the barrels must be recycled when they are destroyed.
	 */
	private static final int MAX_BARRELS = 30;

	/**
	 * Creates a new barrel producer at the given coordinate
	 *
	 * @param xpos The x coordinate of this barrel producer
	 * @param ypos The y coordinate of this barrel producer
	 */
	public BarrelProducer(int xpos, int ypos){
		reset(xpos, ypos);
	}

	/**
	 * reset the position of this barrel producer and clear the barrels
	 *
	 * @param xpos The x coordinate of this barrel producer
	 * @param ypos The y coordinate of this barrel producer
	 */
	public void reset(int xpos, int ypos){
		clear();
		this.xpos = xpos;
		this.ypos = ypos;
	}

	/**
	 * Send a barrel back to be recycled.  Done so that new instances of barrels do
	 * not continually need to be created slowing down garbage collection.
	 *
	 * @param barrel The barrel to be recycled
	 */
	public void recycleBarrel(Barrel barrel){
		barrels.removeElement(barrel);
		allBarrels.addElement(barrel);
	}

	/**
	 * Get the number of Barrels spit out by this barrel producer that are in the wild.
	 *
	 * @return number of barrels.
	 */
	public int getBarrelCount(){
		return barrels.size();
	}

	/**
	 * Retrieve the barrel with the given index
	 *
	 * @param index the barrel number to retrieve
	 * @return the barrel at the given index
	 */
	public Barrel getBarrelAt(int index){
		return (Barrel)barrels.elementAt(index);
	}

	/**
	 * Clear the barrels that have been produced by this barrel producer
	 */
	public void clear(){
		while (barrels.size() > 0){
			allBarrels.addElement(barrels.elementAt(barrels.size()-1));
			barrels.removeElementAt(barrels.size()-1);
		}
	}

	/**
	 * Update this Barrel producer.
	 * Should be called once per frame of the game.
	 * May cause a new barrel to be spit out.
	 */
	public void update(){
		if (barrels.size() < MAX_BARRELS && rnum.nextDouble() < 1.0 / 15.0){
			spitOutBarrel();
		}
	}

	/**
	 * Spit out a barrel
	 * Synchronized to avoid two barrel producers from
	 * trying to spit out the same barrel from the allBarrels list
	 */
	private synchronized void spitOutBarrel(){
		Barrel b;
		if (allBarrels.size() > 0){
			b = (Barrel)allBarrels.elementAt(allBarrels.size()-1);
			allBarrels.removeElementAt(allBarrels.size()-1);
		} else {
			b = new Barrel();
		}
		b.setXPos(xpos);
		b.setYPos(ypos);
		barrels.addElement(b);
	}

//	protected void finalize() throws Exception {
//		while (barrels.size() > 0){
//			allBarrels.addElement(barrels.elementAt(barrels.size()-1));
//			barrels.removeElementAt(barrels.size()-1);
//		}
//	}
}
