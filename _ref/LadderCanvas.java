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
import java.lang.*;
import java.util.*;

/**
 * The LadderCanvas is basically the executable part of the game.  The canvas
 * draws the game on itself.
 *
 */
public class LadderCanvas extends JPanel implements Runnable {
	/**
	 * The instance of Ladder which we should report back to.
	 */
	private Ladder caller; // the caller of this

	private Level screenLevel = new Level();

	private Level realLevel = new Level();

	/**
	 * The lad that is controlled by the player.
	 */
	private Lad lad;
	/**
	 * Charactaristics of the font.
	 */
	private int letterWidth, letterHeight, letterAcsent;
	/**
	 * Size of the font being used.
	 */
	private int fontSize;
	/**
	 * The font being used.
	 */
	private Font font;
	/**
	 * The command the lad should obey on the next frame.
	 */
	public int nextCommand;
	/**
	 * If the lad should jump on the next frame.
	 */
	public boolean jumpCommand;
	/**
	 *
	 */
	private Barrel barrel;
	/**
	 * A list of squares that need to be repainted.
	 */
	private Vector<Dimension> repaintList;
	/**
	 * A list of all the objects that spit out barrels on this level.
	 */
	private Vector<BarrelProducer> barrelProducers;
	/**
	 * Should the entire screen be repainted on the next refresh?
	 */
	private boolean repaintAll;
	/**
	 * The color of the background.
	 */
	private Color bgColor;
	/**
	 * The color of the foreground.
	 */
	private Color fgColor;
	/**
	 *
	 */
	public int gameOver;
	/**
	 *
	 */
	private boolean gameStop;
	/**
	 *
	 */
	public Thread ladderCanvasThread;
	/**
	 * The level of difficulty for the game.
	 */
	private int difficulty;
	/**
	 *
	 */
	private int cycles;
	/**
	 * The score of the game.
	 */
	private long score;
	/**
	 * The number of lives left.
	 */
	private int ladsLeft;
	/**
	 * pause in ms between frames.
	 */
	private int gameSpeed;
	/**
	 *
	 */
	private long nextNewLad;
	/**
	 *
	 */
	boolean stopThread;
	/**
	 *
	 */
	private boolean go_on = false;
	/**
	 * The starting x position of the lad.
	 */
	private int ladStartPosX;
	/**
	 * The starting y position of the lad.
	 */
	private int ladStartPosY;
	/**
	 * The time at which the last beep occurred.
	 */
	private long lastBeep;

	/**
	 * Debug mode that lets us move the game one frame at a time
	 * by pressing enter between each frame.
	 */
	private static final boolean STEP_MODE = false;

	/**      */
	public static final int SCORE_RESET = 0;
	/**      */
	public static final int SCORE_BARREL = 1;
	/**      */
	public static final int SCORE_STATUE = 2;
	/**      */
	public static final int SCORE_MONEY = 3;

	/**      */
	public static final int G_O_NOT_OVER = 0;
	/**      */
	public static final int G_O_BARREL = 1;
	/**      */
	public static final int G_O_TIME = 2;
	/**      */
	public static final int G_O_MONEY = 3;
	/**      */
	public static final int G_O_QUIT = 4;
	/**      */
	public static final int G_O_SPIKE = 5;

	// minimum number of barrels per producer at the level
	/**      */
	public static final int EASY = 3;
	/**      */
	public static final int MEDIUM = 5;
	/**      */
	public static final int HARD = 7;
	/**      */
	public static final int VERY_HARD = 10;
	/**      */
	public static final int IMPOSSIBLE = 15;

	// game speed at the level (milliseconds between frames)
	/**      */
	private static final int EASY_SPEED = 130;
	/**      */
	private static final int MEDIUM_SPEED = 100;
	/**      */
	private static final int HARD_SPEED = 80;
	/**      */
	private static final int VERY_HARD_SPEED = 65;
	/**      */
	private static final int IMPOSSIBLE_SPEED = 55;

	/**
	 * Create a ladder canvas.
	 *
	 * @param level String representation of the level
	 * @param caller The instance of ladder that called this, which we can
	 *     report back to with scores and such
	 */
	public LadderCanvas(String level, Ladder caller){
		this (new Level(level), caller);
	}

	/**
	 * Create a ladder canvas.
	 *
	 * @param level the level to use.
	 * @param caller The instance of ladder that called this, which we can
	 *     report back to with scores and such
	 */
	public LadderCanvas(Level level, Ladder caller){
		lastBeep = 0;
		ladStartPosX = 1;
		ladStartPosY = 1;
		lad = new Lad(ladStartPosX,ladStartPosY,Creature.STATIONARY);
		gameStop = false;
		this.caller = caller;
		bgColor = Color.black;
		fgColor = Color.green;
		repaintList = new Vector<Dimension>();
		barrelProducers = new Vector<BarrelProducer>();
		addKeyListener(new KeyAdapter(){
			 public void keyPressed(KeyEvent ke){
				int keycode = ke.getKeyCode();
				if (keycode == KeyEvent.VK_ESCAPE){
					LadderCanvas.this.caller.togglePause();
				} else if (keycode == KeyEvent.VK_UP || keycode == KeyEvent.VK_NUMPAD8){
					nextCommand = Lad.UP;
				} else if (keycode == KeyEvent.VK_DOWN || keycode == KeyEvent.VK_NUMPAD2){
					nextCommand = Lad.DOWN;
				} else if (keycode == KeyEvent.VK_LEFT || keycode == KeyEvent.VK_NUMPAD4){
					nextCommand = Lad.LEFT;
				} else if (keycode == KeyEvent.VK_RIGHT || keycode == KeyEvent.VK_NUMPAD6){
					nextCommand = Lad.RIGHT;
				} else if (keycode == KeyEvent.VK_SPACE){
					jumpCommand = true;
				} else if (keycode == KeyEvent.VK_ESCAPE){
					//escape is used to pause the game, lets ignore it here
					//it should be caught by main ladder class.
				} else if (STEP_MODE && keycode == KeyEvent.VK_ENTER){
					go_on = true;
				} else {
					nextCommand = Lad.STOP;
				}
			}
		});
		addFocusListener(new FocusAdapter(){
			public void focusLost(FocusEvent e){
				LadderCanvas.this.requestFocus();
			}
		});
		nextCommand = Lad.STOP;
		jumpCommand = false;
		setBackground(bgColor);
		caller.setBackground(bgColor);
		caller.getContentPane().setBackground(bgColor);
		setFontSize(12);
		realLevel = new Level(level);
		screenLevel = new Level(realLevel);
		repaintAll = true;
		setLevelPaint(level);
		cycles = 2000;
		score = 0;
		ladsLeft = 3;
		nextNewLad = 10000;
		caller.setLads(ladsLeft);
		setDifficulty(MEDIUM);
		setOpaque(true);
	}

	/**
	 * Set the size of the font used.
	 *
	 * @param size the size of the font in points
	 */
	public void setFontSize(int size){
		setFont(font = new Font("Monospaced", Font.PLAIN, size));
		FontMetrics fontMetrics = this.getFontMetrics(font);
		letterWidth = fontMetrics.charWidth('m');
		letterHeight = fontMetrics.getHeight();
		letterAcsent = fontMetrics.getAscent();
		fontSize = size;
	}

	/** get the size of the font being used.
	 *
	 * @return the size of the font in points.
	 */
	public int getFontSize(){
		return fontSize;
	}

	/**
	 * Set the background color.
	 *
	 * @param bg Color to use for the background.
	 */
	public void setBGColor(Color bg){
		bgColor = bg;
		setBackground(bgColor);
		caller.setBackground(bgColor);
		caller.getContentPane().setBackground(bgColor);
		repaintAll = true;
		repaint();
	}

	/**
	 * Set the foreground color.
	 *
	 * @param fg Color to use for the foreground.
	 */
	public void setFGColor(Color fg){
		fgColor = fg;
		repaintAll = true;
		repaint();
	}

	/**
	 * Get the background color.
	 *
	 * @return Color currently used for the background.
	 */
	public Color getBGColor(){
		return(new Color(bgColor.getRGB()));
	}

	/**
	 * Get the foreground color.
	 *
	 * @return Color currently used for the foreground.
	 */
	public Color getFGColor(){
		return(new Color(fgColor.getRGB()));
	}

	/**
	 * Change the level to the one given and repaint.
	 *
	 * @param level A string representing the desired level.
	 */
	private void setLevelPaint(String level){
		setLevel(new Level(level));
	}

	/**
	 * Change the level to the one given and repaint.
	 *
	 * @param level A string representing the desired level.
	 */
	private void setLevelPaint(Level level){
		setLevel(level);
		repaintAll = true;
		repaint();
	}

	/**
	 * Set the level to the given level without a repaint.
	 *
	 * @param level A string representing the desired level.
	 */
	public void setLevel(String level){
		setLevel(new Level(level));
	}

	public void setLevel(Level level){
		ladStartPosX = 1;
		ladStartPosY = 1;

		realLevel = new Level(level);
		screenLevel = new Level(level);

		Dimension p = realLevel.positionOf('p');
		if (p == null){
			ladStartPosY = 1;
			ladStartPosX = 1;

		} else {
			ladStartPosY = p.height+1;
			ladStartPosX = p.width+1;
		}
	}

	/**
	 * get the preferred size
	 *
	 * @return the preferred size in pixels
	 */
	public Dimension getPreferredSize() {
		return getMinimumSize();
	}

	/**
	 * gets the minimum size
	 *
	 * @return the minimum size in pixels
	 */
	public synchronized Dimension getMinimumSize() {
		return new Dimension(letterWidth*(realLevel.getColumnCount()), letterHeight*(realLevel.getRowCount()));
	}

	/**
	 * paints the canvas
	 *
	 * @param g graphics object for this component
	 */
	public void paintComponent(Graphics g){
		g.setColor(bgColor);
		Rectangle bounds = g.getClipBounds();
		g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
		g.setColor(fgColor);

		int rowStart = bounds.y / letterHeight;
		int rowEnd = (bounds.y + bounds.height + letterHeight) / letterHeight;
		int columnStart = bounds.x / letterWidth;
		int columnEnd = (bounds.x + bounds.width + letterWidth) / letterWidth;

		for (int i = rowStart; i < rowEnd && i < realLevel.getRowCount(); i++){
			g.drawChars(screenLevel.getCharsAt(i, columnStart, columnEnd - columnStart - 1),
				0, columnEnd-columnStart-1,
				(columnStart)*letterWidth, i * letterHeight + letterAcsent);
		}
		if (gameStop){
			g.setColor(Color.red);
			g.setFont(new Font("SansSerif", Font.BOLD, font.getSize() * 2));
			String p = "GAME OVER";
			g.drawString(p, (getWidth() - g.getFontMetrics().stringWidth(p)) / 2,
				(getHeight()	) / 2);
		} else if (stopThread){
			g.setColor(Color.red);
			g.setFont(new Font("SansSerif", Font.BOLD, font.getSize() * 2));
			String p = "PAUSED";
			g.drawString(p, (getWidth() - g.getFontMetrics().stringWidth(p)) / 2,
				(getHeight()	) / 2);
		}
		repaintAll = true;
	}

	/**
	 * repaints just the region containing a character on the screen
	 *
	 * @param xpos the x position of the character
	 * @param ypos the y position of the character
	 */
	private void repaintCharAt(int xpos, int ypos){
		repaint((xpos-1)*letterWidth, (ypos-1)*letterHeight, letterWidth,letterHeight);
	}

	/**
	 * start the game moving
	 */
	public void start(){
		if (ladderCanvasThread == null || !ladderCanvasThread.isAlive()){
			ladderCanvasThread = new Thread(this);
		}
		ladderCanvasThread.start();
		repaint();
	}

	/**
	 * stop the game from moving
	 */
	public void stop(){
		// set a flag that will make the run method exit.
		stopThread = true;
		repaint();
	}

	/**
	 * reset the game to its initial state, (score, lads, (everything))
	 */
	public void resetGame(){
		//System.out.println("Resetting Game, repainting");
		updateScore(SCORE_RESET);
		ladsLeft = 3;
		nextNewLad = 10000;
		caller.setLads(ladsLeft);
		reset();
		repaintAll = true;
		repaint();
	}

	/**
	 * resets the clocks for the game, but not the score, lives left, etc.
	 */
	public void reset(){
		gameStop = false;
		cycles = 2000;
		gameOver = G_O_NOT_OVER;
		nextCommand = Lad.STOP;
		jumpCommand = false;
		screenLevel = new Level(realLevel);

		lad.reset(ladStartPosX,ladStartPosY,Creature.STATIONARY);
		screenLevel.setCharAt(ladStartPosY-1, ladStartPosX-1, 'p');
		realLevel.setCharAt(ladStartPosY-1, ladStartPosX-1, ' ');
		Dimension p = realLevel.positionOf('V');
		int i;
		for (i=0; i<barrelProducers.size(); i++){
			((BarrelProducer)barrelProducers.elementAt(i)).clear();
		}
		for (i=0; p != null; i++){
			if (i < barrelProducers.size()){
				((BarrelProducer)barrelProducers.elementAt(i)).reset(p.width+1, p.height+1);
			} else {
				barrelProducers.addElement(new BarrelProducer(p.width+1, p.height+1));
			}
			p.width++;
			p = realLevel.positionOf('V', p);
		}
		barrelProducers.setSize(i);
		System.gc();
	}

	/**
	 * Set the difficulty for the game
	 *
	 * @param difficulty level of difficulty
	 */
	public void setDifficulty(int difficulty){
		switch (difficulty){
		case EASY:
			gameSpeed = EASY_SPEED;
		break;
		case MEDIUM:
			gameSpeed = MEDIUM_SPEED;
		break;
		case HARD:
			gameSpeed = HARD_SPEED;
		break;
		case VERY_HARD:
			gameSpeed = VERY_HARD_SPEED;
		break;
		case IMPOSSIBLE:
			gameSpeed = IMPOSSIBLE_SPEED;
		break;
		}
	}


	/**
	 * Runs the game, (but not as a thread)
	 */
	public void run(){
		stopThread = false;
		long beginLoopTime = System.currentTimeMillis();
		long endLoopTime;
		int sleepTime;
		while (!gameStop && !stopThread){
			try{
				while (gameOver == G_O_NOT_OVER && !stopThread){ // While the game is not over
					cycles--;  // time count down
					caller.setBonusTime(cycles);
					//System.out.print(" " + cycles);
					if (cycles <= 0){ // Game over due to out of time
						gameOver = G_O_TIME;
						throw (new GameOverException());
					 }
					// move the lad
					screenLevel.setCharAt(lad.getYPos()-1, lad.getXPos()-1, realLevel.charAt(lad.getYPos()-1, lad.getXPos()-1));
					 repaintList.addElement(new Dimension(lad.getXPos() - 1, lad.getYPos() - 1));
					int oldx = lad.getXPos();
					int oldy = lad.getYPos();
					lad.setCommand(nextCommand);
					nextCommand = Lad.NONE;
					if (jumpCommand){
						lad.setJump();
					}
					jumpCommand = false;
					// tell the lad about its surroundings so that it knows how it can move
					lad.update(
						realLevel.charAt(lad.getYPos() - 1 + 1 , lad.getXPos() - 1 - 1),
						realLevel.charAt(lad.getYPos() - 1 + 1 , lad.getXPos() - 1),
						realLevel.charAt(lad.getYPos() - 1 + 1 , lad.getXPos() - 1 + 1),
						realLevel.charAt(lad.getYPos() - 1 , lad.getXPos() - 1 - 1),
						realLevel.charAt(lad.getYPos() - 1 , lad.getXPos() - 1),
						realLevel.charAt(lad.getYPos() - 1 , lad.getXPos() - 1 + 1),
						realLevel.charAt(lad.getYPos() - 1 - 1 , lad.getXPos() - 1 - 1),
						realLevel.charAt(lad.getYPos() - 1 - 1 , lad.getXPos() - 1),
						realLevel.charAt(lad.getYPos() - 1 - 1 , lad.getXPos() - 1 + 1));
					// redraw the lad
					screenLevel.setCharAt(lad.getYPos()-1, lad.getXPos()-1, lad.getSymbol());
					repaintList.addElement(new Dimension(lad.getXPos(), lad.getYPos()));
					if(realLevel.charAt(lad.getYPos() -1, lad.getXPos() - 1) == '$'){
						gameOver = G_O_MONEY; // Found the goal, game over
						repaint();
						throw (new GameOverException());

					}
					if(realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) == '^'){
						gameOver = G_O_SPIKE; // Found the goal, game over
						throw (new GameOverException());
					}
					if(realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) == '&'){
						// found a statue, adjust the score, remove the statue
						updateScore(SCORE_STATUE);
						realLevel.setCharAt(lad.getYPos()-1, lad.getXPos()-1, ' ');
					}
					// get rid of disappearing flooring
					if ((lad.getXPos() != oldx && lad.getYPos() >= oldy) && realLevel.charAt(oldy - 1 + 1, oldx - 1) == '-'){
						// get rid of flooring only if the lad moved over it without jumping.
						// so don't remove if he stayed in the same place or if his y pos has gone up.
						screenLevel.setCharAt(oldy, oldx-1, ' ');
						realLevel.setCharAt(oldy, oldx-1, ' ');
						repaintList.addElement(new Dimension(oldx, oldy + 1));
						//repaintCharAt(oldx, oldy + 1);
					}
					// update and repaint all the barrels
					for (int k=0; k<barrelProducers.size(); k++){
						BarrelProducer BP = (BarrelProducer)barrelProducers.elementAt(k);
						BP.update();
						for (int j=0; j<BP.getBarrelCount(); j++){
							Barrel barrel = BP.getBarrelAt(j);
							if (barrel != null){
								if(barrel.getYPos() == lad.getYPos() &&  lad.getXPos() == barrel.getXPos()){
									gameOver = G_O_BARREL;
									throw (new GameOverException());
								}
								// score for jumping barrels
								if (realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) != 'H'){ // no score if on ladder
									if(barrel.getYPos() - 1 == lad.getYPos() &&  lad.getXPos()  == barrel.getXPos()){
										updateScore(SCORE_BARREL);
									} else if(barrel.getYPos() - 2 == lad.getYPos() &&  lad.getXPos()  == barrel.getXPos() &&
										realLevel.charAt((lad.getYPos() - 1 + 1), lad.getXPos() - 1) != '=' &&
										realLevel.charAt((lad.getYPos() - 1 + 1), lad.getXPos() - 1) != '|' &&
										realLevel.charAt((lad.getYPos() - 1 + 1), lad.getXPos() - 1) != '-'){
										updateScore(SCORE_BARREL);
									}
								}
								screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1 ,
									realLevel.charAt(barrel.getYPos() - 1, barrel.getXPos() - 1));
								repaintList.addElement(new Dimension(barrel.getXPos(), barrel.getYPos()));
								barrel.update(
									realLevel.charAt(barrel.getYPos() - 1 + 1 , barrel.getXPos() - 1 - 1),
									realLevel.charAt(barrel.getYPos() - 1 + 1 , barrel.getXPos() - 1),
									realLevel.charAt(barrel.getYPos() - 1 + 1 , barrel.getXPos() - 1 + 1),
									realLevel.charAt(barrel.getYPos() - 1 , barrel.getXPos() - 1 - 1),
									realLevel.charAt(barrel.getYPos() - 1 , barrel.getXPos() - 1),
									realLevel.charAt(barrel.getYPos() - 1 , barrel.getXPos() - 1 + 1),
									realLevel.charAt(barrel.getYPos() - 1 - 1 , barrel.getXPos() - 1 - 1),
									realLevel.charAt(barrel.getYPos() - 1 - 1 , barrel.getXPos() - 1),
									realLevel.charAt(barrel.getYPos() - 1 - 1 , barrel.getXPos() - 1 + 1));
								screenLevel.setCharAt(barrel.getYPos() - 1, barrel.getXPos() - 1, barrel.getSymbol());
								repaintList.addElement(new Dimension(barrel.getXPos(), barrel.getYPos()));
								if(barrel.getYPos() == lad.getYPos() &&  lad.getXPos() == barrel.getXPos()){
									gameOver = G_O_BARREL;
									throw (new GameOverException());
								}
								// score for jumping barrels
								if (lad.getDirection() != Creature.UP && lad.getDirection() != Creature.DOWN && // no score this time if the lad is moving up or down to avoid double counting of score
									realLevel.charAt(lad.getYPos() - 1, lad.getXPos() - 1) != 'H'){ // no score if on ladder
									if(barrel.getYPos() - 1 == lad.getYPos() &&  lad.getXPos()  == barrel.getXPos()){
										updateScore(SCORE_BARREL);
									} else if(barrel.getYPos() - 2 == lad.getYPos() &&  lad.getXPos()  == barrel.getXPos() &&
										realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '=' &&
										realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '|' &&
										realLevel.charAt(lad.getYPos() - 1 + 1, lad.getXPos() - 1) != '-'){
										updateScore(SCORE_BARREL);
									}
								}
								if (realLevel.charAt(barrel.getYPos() - 1, barrel.getXPos() - 1) == '*'){
									screenLevel.setCharAt(barrel.getYPos()-1, barrel.getXPos()-1,
										realLevel.charAt(barrel.getYPos() - 1, barrel.getXPos() - 1));
									repaintList.addElement(new Dimension(barrel.getXPos(), barrel.getYPos()));
									BP.recycleBarrel(barrel);
								}
							}
						}
					}
					repaintAll = false;
					repaint();

					endLoopTime = System.currentTimeMillis();
					sleepTime = (int)(gameSpeed - (endLoopTime - beginLoopTime));
					if (sleepTime > 0){
						try{
							Thread.sleep(sleepTime);
						} catch (InterruptedException e){
						}
					}
					if (STEP_MODE){
						while (!go_on){
							try{
								Thread.sleep(100);
							} catch (InterruptedException e){
							}
						}
						go_on = false;
					}
					beginLoopTime = System.currentTimeMillis();
				}
			} catch (GameOverException e){
			}
			// End game here

			switch (gameOver){
			case G_O_BARREL: case G_O_TIME: case G_O_SPIKE:
				ladDeath();
				if (ladsLeft > 0){
					ladsLeft--;
					caller.setLads(ladsLeft);
					//System.out.println("Restarting Level");
					reset();
					gameStop = false;
				} else {
					gameStop = true;
					caller.gameOver(score);
					repaint();
				}
			break;
			case G_O_MONEY:
				dollarCountdown();
				caller.changeLevel();
				reset();
				gameStop = false;
			break;
			case G_O_NOT_OVER: // the game is not over.  Thread is stopped.
				gameStop = false;
			break;
			default:
				gameStop = true;
				repaint();
			break;
			}
		}
	}

	/**
	 * Slowly increments the score as the bonus time is decremented for the end of the
	 * level countdown.
	 */
	private void dollarCountdown(){
		while (cycles > 0){
			caller.setBonusTime(cycles);
			updateScore(SCORE_MONEY);
			cycles -= 10;
			try{
				Thread.sleep(10);
			} catch (InterruptedException e){
			}
		}
		caller.setBonusTime(0);
	}

	/**
	 * sounds a beep.
	 */
	private void beep(){
		if (System.currentTimeMillis() - lastBeep > 150){
			getToolkit().beep();
			lastBeep = System.currentTimeMillis();
		}
	}

	/**
	 * kill the lad off in a horrible death of mixed up characters.
	 */
	private void ladDeath(){
		int i;
		long beginLoopTime, endLoopTime;
		char[] symbols = {'!', '@', '#', '/', '+', '%', '?', '\\', '*', 'b'};
		int sleepTime;
		for (i=0; i<symbols.length; i++){
			beginLoopTime = System.currentTimeMillis();
			beep();
			screenLevel.setCharAt(lad.getYPos()-1, lad.getXPos()-1, symbols[i]);
			repaint();
			endLoopTime = System.currentTimeMillis();
			sleepTime = (int)(gameSpeed - (endLoopTime - beginLoopTime));
			if (sleepTime > 0){
				try{
					Thread.sleep(50);
				} catch (InterruptedException e){
				}
			}
		}
	}

	/**
	 * Adjusts the score according to some event.
	 *
	 * @param scoreind Type of scoring even
	 */
	private void updateScore(int scoreind){
		switch (scoreind){
		case SCORE_STATUE:
			score += cycles;
			beep();
		break;
		case SCORE_RESET:
			score = 0;
		break;
		case SCORE_BARREL:
			score += 200;
			beep();
		break;
		case SCORE_MONEY:
			score += 10;
			beep();
		break;
		}
		// give a new lad if over 10,000 points
		if (score > nextNewLad){
			ladsLeft++;
			caller.setLads(ladsLeft);
			nextNewLad += 10000;
		}
		caller.setScore(score);
		//System.out.println(score);
	}

	/**
	 * Some key has been pressed, react to it.
	 *
	 * @param ke The key event corresponding to the key
	 */
	public void keyPressed(KeyEvent ke){
		int keycode = ke.getKeyCode();
		if (keycode == KeyEvent.VK_UP || keycode == KeyEvent.VK_NUMPAD8){
			nextCommand = Lad.UP;
		} else if (keycode == KeyEvent.VK_DOWN || keycode == KeyEvent.VK_NUMPAD2){
			nextCommand = Lad.DOWN;
		} else if (keycode == KeyEvent.VK_LEFT || keycode == KeyEvent.VK_NUMPAD4){
			nextCommand = Lad.LEFT;
		} else if (keycode == KeyEvent.VK_RIGHT || keycode == KeyEvent.VK_NUMPAD6){
			nextCommand = Lad.RIGHT;
		} else if (keycode == KeyEvent.VK_SPACE){
			jumpCommand = true;
		} else if (keycode == KeyEvent.VK_ESCAPE){
			//escape is used to pause the game, lets ignore it here
			//it should be caught by main ladder class.
		} else if (STEP_MODE && keycode == KeyEvent.VK_ENTER){
			go_on = true;
		} else {
			nextCommand = Lad.STOP;
		}
	}
}
