https://tryhackme.com/room/jupyter101

START MACHINE + attackbox

browser  IP
- `tryhackme`

```
click on "UnderstandingJupyterNotebooks" directory
click on UnderstandingJupyterNotebook.ipynb

what do "Cells" act like?

interpreter

  
What would be the In[#] value of the first Cell when it is ran for the first time? (Where # would be the numerical value)

1

  
What keyboard shortcut can you press to execute a cell?

shift + Enter

  
If you was to execute the first Cell again, what would the value of In[#] now become? (Where # would be the numerical value)

2

```

Filesystem

In this case, I have told Jupyter to launch within the "thm" users home directory, where you will later log into and see for yourself.

```
# open terminal, ssh on port 22
ssh -l thm @10.10.x.x    tryhackme

```

Data with Pandas

```
click on IntroToPandas/IntroToPandas.ipynb

What are the two main types of data within Pandas?

series and dataframes

What is the name of the Pandas function that reads a CSV file?

read_csv

  
Name the Pandas function you would use if you only wanted to display the first few rows

head

  
Name the Pandas function you would use if you only wanted to display the last few rows

tail

  
What Pandas function will give you a numerical count of the amount of columns and rows the dataset contains?

shape
```

data with matplotlib

```
click on IntroToMatplotlib/IntroToMatplotlib.ipynb

  
How do you display a plot?

plot()

  
How would you label the "x" axis on a plot?

xlabel      (should be plt.xlabel)

  
How would you label the "y" axis on a plot?

ylabel

  
How would you add a "Title" to a plot?

title

  
What word would you use to change the color of the plot?

color

  
How would you label the "z" axis on a plot?

zlabel

```

