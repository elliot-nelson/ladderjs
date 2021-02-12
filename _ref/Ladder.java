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
import java.io.*;
import java.util.*;
import java.net.URL;

/**
 * Ladder is a classic computer game originally written for the CPM
 * operating system.  It is entirely based in ASCII characters.
 */
public class Ladder extends JFrame {
	/**
	 * The canvas that displays the main part of the game
	 */
	private LadderCanvas ladderCanvas;

	/**
	 * Create an instance of a barrel producer to cut down on new barrel production
	 * and prevent barrels from being garbage collected.
	 */
	private static BarrelProducer barrelProducer = new BarrelProducer(0,0);

	/**
	 * menu items in the menus
	 */
	private JMenuItem openItem, editItem, saveItem, newItem, bgItem,
		fgItem, exitItem, fontItem, scoresItem;

	/**
	 * menu itime in the edit menu
	 */
	private JCheckBoxMenuItem pauseItem;

	/**
	 * menu items in the difficulty menu
	 */
	private JRadioButtonMenuItem easyItem, mediumItem,
		hardItem, veryHardItem, impossibleItem;

	/**
	 * for displaying the score and lives left and stuff
	 */
	private JLabel ladField, levelField, scoreField, bonusTimeField;

	/**
	 * the text representation of the current level
	 */
	private Level level;

	/**
	 * Array of high scores.
	 */
	private HighScoreList highScores = new HighScoreList();

	/**
	 * Is the game running, as opposed to over, not started, or paused?
	 */
	private boolean running;

	/**
	 * Properties for this application
	 */
	private Properties defaultProps, props;

	/**
	 * Menu with all the levels in it.
	 */
	private JMenu levelMenu;

	/**
	 * the number of the current level being played
	 */
	private int currLevel = 0;

	/**
	 * Array of choices for font sizes.
	 */
	private final static Integer[] FONT_SIZES = {
		8, 9, 10, 11, 12, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48, 72,
	};

	private JLabel makeLabel(String text, Color fg, Color bg, int fontSize) {
		JLabel label = new JLabel();
		label.setText(text);
		label.setOpaque(true);
		label.setBackground(fg);
		label.setForeground(bg);
		label.setFont(new Font("Monospaced", Font.BOLD, fontSize));
		return label;
	}

	/**
	 * Create a new Ladder game.
	 */
	public Ladder(){

		loadProperties();
		running = false;
		//Build the menu bar.
		JMenuBar ladderMenuBar = new JMenuBar();
		setJMenuBar(ladderMenuBar);
		ButtonGroup difficultyGroup = new ButtonGroup();
		ButtonGroup levelGroup = new ButtonGroup();
		//Build first menu in the menu bar.
		//Specifying the second argument as true
		//makes this a tear-off menu.

		ActionListener actList = new ActionListener(){
			/**
			 * action performed
			 *
			 * @param event action performed
			 */
			public void actionPerformed(java.awt.event.ActionEvent event){
				Color temp;
				Object object = event.getSource();
				if (object == exitItem){
					exit();
				} else if (object == bgItem){
					temp = JColorChooser.showDialog(Ladder.this, "Background Color", ladderCanvas.getBGColor());
					if (temp != null){
						ladderCanvas.setBGColor(temp);
						props.put("Background Color", ("" + temp.getRGB()));
					}
				} else if (object == fgItem){
					temp = JColorChooser.showDialog(Ladder.this, "Background Color", ladderCanvas.getFGColor());
					if (temp != null){
						ladderCanvas.setFGColor(temp);
						props.put("Foreground Color", ("" + temp.getRGB()));
					}
				} else if (object == newItem){
					startGame();
				} else if (object == openItem){
					FileDialog fd = new FileDialog(Ladder.this, "Open a Level", FileDialog.LOAD);
					fd.setFile("*.lvl");
					fd.setVisible(true);
					String s = fd.getFile();
					if (s != null){
						try {
							Level level = new Level();
							level.load(s);
							changeLevel(level);
							Component[] levels = levelMenu.getMenuComponents();
							if (level.isChanged()){
								level.store(s);
								System.out.println(s + " cleaned up and resaved.");
							}
							for (int i=0; i<levels.length; i++){
								LevelMenuItem menuItem = (LevelMenuItem)levels[i];
								menuItem.setSelected(false);
							}
						} catch (IOException e){
							System.err.println(e.getMessage());
						}
					}
				} else if (object == easyItem){
					 ladderCanvas.setDifficulty(LadderCanvas.EASY);
				} else if (object == mediumItem){
					 ladderCanvas.setDifficulty(LadderCanvas.MEDIUM);
				} else if (object == hardItem){
					 ladderCanvas.setDifficulty(LadderCanvas.HARD);
				} else if (object == veryHardItem){
					 ladderCanvas.setDifficulty(LadderCanvas.VERY_HARD);
				} else if (object == impossibleItem){
					 ladderCanvas.setDifficulty(LadderCanvas.IMPOSSIBLE);
				} else if (object == saveItem){
					FileDialog fd = new FileDialog(Ladder.this, "Save a Level", FileDialog.SAVE);
					fd.setFile("*.lvl");
					fd.setVisible(true);
					if (fd.getFile() != null){
						try {
							level.store(fd.getFile());
						} catch (IOException e){
							System.err.println(e.getMessage());
						}
					}
				} else if (object == editItem){
					 new Editor(level.getLevel(), Ladder.this);
				} else if (object == scoresItem){
					highScores.showHighScoreWindow(Ladder.this);
				} else if (object == fontItem){
					Integer i;
					i = (Integer)JOptionPane.showInputDialog(Ladder.this,
						"Please pick a font size", "Font Size", JOptionPane.QUESTION_MESSAGE,
						null, FONT_SIZES, Integer.valueOf(ladderCanvas.getFontSize()));
					if (i!=null){
						ladderCanvas.setFontSize(i.intValue());
						props.put("Font Size", ("" + i.intValue()));
						pack();
					}
				} else if (object instanceof LevelMenuItem){
					try {
						changeLevel(((LevelMenuItem)object).getLevel());
					} catch (IOException e){
						System.err.println(e.getMessage());
					}
				}
			}
		};
		JMenu fileMenu = new JMenu("File", true);
		fileMenu.setMnemonic('f');
		ladderMenuBar.add(fileMenu);
		openItem = new JMenuItem("Open Level...", 'o');
		openItem.addActionListener(actList);
		fileMenu.add(openItem);
		saveItem = new JMenuItem("Save Level...", 's');
		saveItem.addActionListener(actList);
		fileMenu.add(saveItem);
		newItem = new JMenuItem("New Game", 'n');
		newItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F2, 0));
		newItem.addActionListener(actList);
		fileMenu.add(newItem);
		scoresItem = new JMenuItem("High Scores...", 'h');
		scoresItem.addActionListener(actList);
		fileMenu.add(scoresItem);
		exitItem = new JMenuItem("Exit", 'x');
		exitItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F4, ActionEvent.ALT_MASK));
		exitItem.addActionListener(actList);
		fileMenu.add(exitItem);

		//Build second menu in the menu bar.
		JMenu editMenu = new JMenu("Edit");
		editMenu.setMnemonic('e');
		ladderMenuBar.add(editMenu);
		pauseItem = new JCheckBoxMenuItem("Pause", false);
		pauseItem.setMnemonic('p');
		pauseItem.setAccelerator(KeyStroke.getKeyStroke(KeyEvent.VK_F3, 0));
		pauseItem.addItemListener(
			new ItemListener(){
				/**
				 * item state changed
				 *
				 * @param event item state changed
				 */
				public void itemStateChanged(java.awt.event.ItemEvent event){
					Object object = event.getSource();
					if (object == pauseItem){
						if (pauseItem.getState()){
							if (ladderCanvas.ladderCanvasThread != null && ladderCanvas.ladderCanvasThread.isAlive()){
								ladderCanvas.stop();
							}
						} else {
							if (ladderCanvas.ladderCanvasThread == null || !ladderCanvas.ladderCanvasThread.isAlive()){
								ladderCanvas.start();
							}
						}
					}
				}
			}
		);
		editMenu.add(pauseItem);
		editItem = new JMenuItem("Edit Level...", 'd');
		editItem.addActionListener(actList);
		editMenu.add(editItem);

		//Build the Options menu bar
		JMenu optionsMenu = new JMenu("Options");
		optionsMenu.setMnemonic('o');
		ladderMenuBar.add(optionsMenu);
		fontItem = new JMenuItem("Font Size...", 'z');
		fontItem.addActionListener(actList);
		optionsMenu.add(fontItem);
		bgItem = new JMenuItem("Background Color...", 'b');
		bgItem.addActionListener(actList);
		optionsMenu.add(bgItem);
		fgItem = new JMenuItem("Foreground Color...", 'f');
		fgItem.addActionListener(actList);
		optionsMenu.add(fgItem);

		//Build the difficulty menu bar
		JMenu difficultyMenu = new JMenu("Difficulty");
		difficultyMenu.setMnemonic('d');
		ladderMenuBar.add(difficultyMenu);
		easyItem = new JRadioButtonMenuItem("Easy");
		easyItem.setMnemonic('e');
		difficultyGroup.add(easyItem);
		easyItem.addActionListener(actList);
		difficultyMenu.add(easyItem);
		mediumItem = new JRadioButtonMenuItem("Medium", true);
		mediumItem.setMnemonic('m');
		difficultyGroup.add(mediumItem);
		mediumItem.addActionListener(actList);
		difficultyMenu.add(mediumItem);
		hardItem = new JRadioButtonMenuItem("Hard");
		hardItem.setMnemonic('h');
		difficultyGroup.add(hardItem);
		hardItem.addActionListener(actList);
		difficultyMenu.add(hardItem);
		veryHardItem = new JRadioButtonMenuItem("Very Hard");
		veryHardItem.setMnemonic('v');
		difficultyGroup.add(veryHardItem);
		veryHardItem.addActionListener(actList);
		difficultyMenu.add(veryHardItem);
		impossibleItem = new JRadioButtonMenuItem("Impossible");
		impossibleItem.setMnemonic('i');
		difficultyGroup.add(impossibleItem);
		impossibleItem.addActionListener(actList);
		difficultyMenu.add(impossibleItem);

		levelMenu = new JMenu("Level");
		levelMenu.setMnemonic('l');
		ladderMenuBar.add(levelMenu);

		// load the levels from the property file.
		int i = 1;
		String s = props.getProperty("Level1Name", "");
		String s1 = props.getProperty("Level1", "");
		LevelMenuItem m;
		// add the names of the levels to the menu
		while (s1.compareTo("") != 0){
			if (s.compareTo("") == 0){
				s = "Level " + i;
			}
			if (i==1){
				m = new LevelMenuItem(s, true);
			} else {
				m = new LevelMenuItem(s, false);
			}

			levelMenu.add(m);
			m.addActionListener(actList);
			m.setFileName(s1);
			levelGroup.add(m);
			i++;
			s = props.getProperty("Level" + i + "Name", "");
			s1 = props.getProperty("Level" + i, "");
		}

		int bgColor, fgColor;
		try {
			bgColor = Integer.parseInt(props.getProperty("Background Color", "" + Color.black.getRGB()), 10);
		} catch (NumberFormatException e){
			bgColor = Color.black.getRGB();
		}

		try {
			fgColor = Integer.parseInt(props.getProperty("Foreground Color", "" + Color.green.getRGB()), 10);
		} catch (NumberFormatException e){
			fgColor = Color.green.getRGB();
		}
		int fs;
		try {
			fs = Integer.parseInt(props.getProperty("Font Size", "14"), 10);
		} catch (NumberFormatException e){
			fs = 14;
		}

		// put the labels at the bottom of the screen
		ladField = makeLabel("Lads     3", new Color(fgColor), new Color(bgColor), fs);
		levelField = makeLabel("Level     1", new Color(fgColor), new Color(bgColor), fs);
		scoreField = makeLabel("Score     0", new Color(fgColor), new Color(bgColor), fs);
		bonusTimeField = makeLabel("Bonus time     2000", new Color(fgColor), new Color(bgColor), fs);

		level = nextLevel(0); // Load the first level

		// initialize the game
		ladderCanvas = new LadderCanvas(level, this);
		ladderCanvas.setBGColor(new Color(bgColor));
		ladderCanvas.setFGColor(new Color(fgColor));
		ladderCanvas.setFontSize(fs);

		// lay out this frame using a grid bag layout
		GridBagLayout gridbag = new GridBagLayout();
		GridBagConstraints c = new GridBagConstraints();

		c.gridx = 0;
		c.gridy = 0;
		c.gridheight = 1;
		c.gridwidth = GridBagConstraints.REMAINDER;
		c.fill= GridBagConstraints.NONE;
		gridbag.setConstraints(ladderCanvas, c);
		this.getContentPane().add(ladderCanvas);

		c.gridx = 0;
		c.gridy = 1;
		c.gridheight = 1;
		c.gridwidth = 1;
		c.ipadx = 30;
		gridbag.setConstraints(ladField, c);
		this.getContentPane().add(ladField);

		c.gridx = 1;
		c.gridy = 1;
		c.gridheight = 1;
		c.gridwidth = 1;
		gridbag.setConstraints(levelField, c);
		this.getContentPane().add(levelField);

		c.gridx = 2;
		c.gridy = 1;
		c.gridheight = 1;
		c.gridwidth = 1;
		gridbag.setConstraints(scoreField, c);
		this.getContentPane().add(scoreField);

		c.gridx = 3;
		c.gridy = 1;
		c.gridheight = 1;
		c.gridwidth = 1;
		c.fill= GridBagConstraints.HORIZONTAL;
		gridbag.setConstraints(bonusTimeField, c);
		this.getContentPane().add(bonusTimeField);

		this.getContentPane().setLayout(gridbag);

		// decide on the position of the frame on the screen
		int x, y;
		try {
			x = Integer.parseInt(props.getProperty("WindowX", "50"), 10);
		} catch (NumberFormatException e){
			x = 50;
		}
		try {
			y = Integer.parseInt(props.getProperty("WindowY", "50"), 10);
		} catch (NumberFormatException e){
			y = 50;
		}
		this.setLocation(x, y);
		this.addWindowListener(
			new WindowAdapter(){

				/**
				 * true iff ladder was paused by the window being deactivated
				 * This allows us to only unpause the game on reactivation
				 * if it was paused because of this and not deliberately by
				 * the game player.
				 */
				private boolean autopause = false;

				/** window closing
				 *
				 * @param event window closing
				 */
				public void windowClosing(java.awt.event.WindowEvent event){
					Object object = event.getSource();
					if (object == Ladder.this){
						exit();
					}
				}

				/**
				 * window activated
				 *
				 * @param event window activated
				 */
				public void windowActivated(java.awt.event.WindowEvent event){
					if (pauseItem.getState() && autopause){
						autopause = false;
						unpause();
					}
				}

				/**
				 * window deactivated
				 *
				 * @param event window deactivated
				 */
				public void windowDeactivated(java.awt.event.WindowEvent event){
					if (!pauseItem.getState()){
						pause();
						autopause = true;
					}
				}
			}
		);
		addFocusListener(new FocusAdapter(){
			public void focusGained(FocusEvent e){
				ladderCanvas.requestFocus();
			}
		});
		this.setResizable(true);
		this.setTitle("Ladder");
		this.pack();
		running = true;
	}

	/**
	 * set the current level
	 *
	 * @param level A string representing the level.
	 */
	public void setLevel(String level){
		setLevel(new Level(level));
	}

	/**
	 * set the current level
	 *
	 * @param level the desired Level.
	 */
	public void setLevel(Level level){
		//pause();
		this.level = level;
		ladderCanvas.setLevel(level);
		this.pack();
		startLevel();
	}

	/**
	 * Run the game
	 *
	 * @param args command line arguments are ignored.
	 */
	public static void main(String args[]){
		Ladder ladder = new Ladder();
		ladder.setVisible(true);
		ladder.startLevel();
	}

	/**
	 * Set the score
	 *
	 * @param s the current score
	 */
	public void setScore(long s){
		scoreField.setText("Score     " + s);
	}

	/**
	 * Set the number of lads
	 *
	 * @param s current number of lads
	 */
	public void setLads(int s){
		ladField.setText("Lads     " + s);
	}

	/**
	 * set the level
	 *
	 * @param s number of the level to set to
	 */
	public void setLevel(int s){
		levelField.setText("Level     " + s);
	}

	/**
	 * set the bonus time
	 *
	 * @param s current bonus time
	 */
	public void setBonusTime(int s){
		bonusTimeField.setText("Bonus time     " + s);
	}

	/**
	 * change to the next level
	 */
	public void changeLevel(){
		level = nextLevel();
		ladderCanvas.setLevel(level);
		ladderCanvas.reset();
		this.pack();
	}

	/**
	 * change to the specified level
	 *
	 * @param level name of  the level to change to
	 */
	public void changeLevel(String level){
		changeLevel(new Level(level));
	}

	/**
	 * change to the specified level
	 *
	 * @param level name of  the level to change to
	 */
	public void changeLevel(Level level){
		this.level = level;
		ladderCanvas.setLevel(level);
		ladderCanvas.resetGame();
		// since we change to a new level
		currLevel = -1;
		setLevel(currLevel);
		this.pack();
		unpause();
	}

	/**
	 * get the level after the specified level
	 *
	 * @param ind number of the level
	 * @return the text of the level
	 */
	public Level nextLevel(int ind){
		if (ind < 0){
			currLevel = -1;
			setLevel(currLevel);
			return level;
		} else {
			if (ind == 0 && ladderCanvas != null){
				ladderCanvas.resetGame();
			}
			Component[] levels = levelMenu.getMenuComponents();
			currLevel = ind + 1;
			int levelNum = currLevel;
			for (int i=0; i<levels.length; levelNum++, i++){
				try {
					LevelMenuItem menuItem = (LevelMenuItem)levels[
						getLevelIndex((levelNum - 1) % getNumberLevels(levels.length))];
					level = menuItem.getLevel();
					menuItem.setSelected(true);
					break;
				} catch (IOException e){
					System.err.println(e.getMessage());
				}
			}
			setLevel(currLevel);
			return level;
		}
	}

	/**
	 * Given a number of unique levels, get the total number of
	 * levels that a person must go through to play all of them
	 * Levels are played in this fashion:
	 * 1 2 1 2 3 1 2 3 4 ....
	 *
	 * @param uniqueLevels the total number of unique levels
	 * @return the number of levels.
	 */
	private static int getNumberLevels(int uniqueLevels){
		if (uniqueLevels == 1){
			return 1;
		}
		int numLevels = 0;
		for (int i=2; i<=uniqueLevels; i++){
			numLevels += i;
		}
		return numLevels;
	}

	/**
	 * Given the level number get the array index
	 * number of that level.
	 * Levels are played in this fashion:
	 * 1 2 1 2 3 1 2 3 4 ....
	 *
	 * @param levelNumber level number of which to find index.
	 * @return the index number of the level.
	 */
	private static int getLevelIndex(int levelNumber){
		for (int i=2; levelNumber >= i; i++){
			levelNumber -= i;
		}
		return levelNumber;
	}

	/**
	 * get the next level
	 *
	 * @return the text of the next level
	 */
	public Level nextLevel(){
		return (nextLevel(currLevel));
	}

	/**
	 * Start game at the current level.
	 */
	public void startLevel(){
		pause();
		ladderCanvas.reset();
		unpause();
	}

	/**
	 * Start the game at the first level.
	 */
	public void startGame(){
		changeLevel(nextLevel(0));
		currLevel=1;
		setLevel(currLevel);
		unpause();
	}

	/**
	 * Pause the game.
	 */
	private void pause(){
		pauseItem.setState(true);
		if (ladderCanvas.ladderCanvasThread != null && ladderCanvas.ladderCanvasThread.isAlive()){
			ladderCanvas.stop();
		}
	}

	/**
	 * Unpause the game.
	 */
	private void unpause(){
		if (ladderCanvas.ladderCanvasThread == null || !ladderCanvas.ladderCanvasThread.isAlive()){
			ladderCanvas.start();
			pauseItem.setState(false);
		}
	}

	/**
	 * Pause the game if going, unpause it if paused.
	 */
	public void togglePause(){
		if(pauseItem.getState()){
			unpause();
		} else {
			pause();
		}
	}

	/**
	 * Load the properties file.
	 */
	private void loadProperties(){
		defaultProps = new Properties();
		try{
			URL url = ClassLoader.getSystemResource("com/Ostermiller/Ladder/Ladder.ini");
			defaultProps.load(url.openStream());
		} catch (IOException e){
			System.err.println(ClassLoader.getSystemResource("com/Ostermiller/Ladder/Ladder.ini"));
			System.err.println("com.Ostermiller.Ladder.Ladder.ini not found");
		}
		props = new Properties(defaultProps);
		try{
			File propsFile = new File(System.getProperty("user.home"), ".java");
			propsFile = new File(propsFile, "Ladder");
			propsFile.mkdirs();
			propsFile = new File(propsFile, "LadderUser.ini");
			FileInputStream fis = new FileInputStream(propsFile);
			props.load(fis);
			fis.close();
		} catch (IOException e){
		}
		highScores.load(props);
	}

	/**
	 * Store the properties file.
	 */
	private void storeProperties(){
		// record the new window position
		Point p = getLocation();
		props.put("WindowX", ("" + p.x));
		props.put("WindowY", ("" + p.y));
		// put the high scores list in the properties
		highScores.store(props);
		try{
			File propsFile = new File(System.getProperty("user.home"), ".java");
			propsFile = new File(propsFile, "Ladder");
			propsFile.mkdirs();
			propsFile = new File(propsFile, "LadderUser.ini");
			FileOutputStream f = new FileOutputStream(propsFile);
			props.store(f, "User Preferences for Ladder");
			f.close();
		} catch (IOException e){
			System.err.println("Could not open LadderUser.ini");
		}
	}

	/**
	 * quit the game
	 */
	private void exit(){
		setVisible(false); // hide the Frame
		storeProperties(); // save the properties
		dispose();         // free the system resources
		System.exit(0);    // close the application
	}

	/**
	 * A menu item that has methods for setting the file name of a level
	 * and returning the level.
	 */
	private class LevelMenuItem extends JRadioButtonMenuItem {

		/**
		 * Creates a LevelMenuItem with no set text or icon.
		 */
		public LevelMenuItem(){
			super();
		}

		/**
		 * Creates a LevelMenuItem with an icon.
		 *
		 * @param icon the Icon to display
		 */
		public LevelMenuItem(Icon icon){
			super(icon);
		}

		/**
		 * Creates a LevelMenuItem with text.
		 *
		 * @param text the text of the LevelMenuItem
		 */
		public LevelMenuItem(String text){
			super(text);
		}

		/**
		 * Creates a LevelMenuItem item whose properties are taken from the Action supplied.
		 *
		 * @param a the Action on which to base the radio button menu item
		 */
		public LevelMenuItem(Action a){
			super(a);
		}

		/**
		 * Creates a LevelMenuItem item with the specified text and Icon.
		 *
		 * @param text the text of the LevelMenuItem
		 * @param icon the icon to display on the LevelMenuItem
		 */
		public LevelMenuItem(String text, Icon icon){
			super(text, icon);
		}

		/**
		 * Creates a LevelMenuItem item with the specified text and selection state.
		 *
		 * @param text the text of the LevelMenuItem
		 * @param selected the selected state of the LevelMenuItem
		 */
		public LevelMenuItem(String text, boolean selected){
			super(text, selected);
		}

		/**
		 * Creates a LevelMenuItem item with the specified image and selection state, but no text.
		 *
		 * @param icon the image that the button should display
		 * @param selected if true, the button is initially selected; otherwise, the button is initially unselected
		 */
		public LevelMenuItem(Icon icon, boolean selected){
			super(icon, selected);
		}

		/**
		 * Creates a LevelMenuItem item that has the specified text, image, and selection state. All other constructors defer to this one.
		 *
		 * @param icon the image that the button should display
		 * @param text the string displayed on the radio button
		 * @param selected if true, the button is initially selected; otherwise, the button is initially unselected
		 */
		public LevelMenuItem(String text, Icon icon, boolean selected){
			super(text, icon, selected);
		}

		 /**
		 * Filename from which the level should be loaded
		 */
		private String fileName;

		/**
		 * Set the filename of the level.
		 *
		 * @param the file name of the level to load.
		 */
		public void setFileName(String fileName){
			level = null;
			this.fileName = fileName;
		}

		/**
		 * The loaded level
		 */
		private Level level;

		/**
		 * Returns the level that is named by the filename.
		 *
		 * @exception if the level cannot be loaded
		 * @return the level to be used, or null if the file has not been specified.
		 */
		public Level getLevel() throws java.io.IOException {
			if (fileName == null){
				return null;
			}
			if (level != null){
				return level;
			}
			level = new Level();
			level.load(fileName);
			return level;
		}
	}

	/**
	 * report to GUI that the game is over
	 *
	 * @param score the score at the end of the game
	 */
	public void gameOver(long score){
		if (currLevel > 0 && highScores.canBeAdded(score)){
			String name = JOptionPane.showInputDialog(this,
				"Congratulation!\nYou got a high score.\nPlease enter your name below.",
				"High Score", JOptionPane.QUESTION_MESSAGE);
			if (name == null){
				name = "";
			}
			highScores.add(new HighScore(score, currLevel, name));
			highScores.showHighScoreWindow(this);
		}
	}
}
