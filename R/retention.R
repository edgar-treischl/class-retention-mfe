# Rcode to fool around
library(readxl)
library(ggplot2)

class_retention <- read_excel("src/app_updates/class_retention.xlsx")

class_retention$number <- as.integer(class_retention$number)



retention <- class_retention |> 
  #dplyr::filter(syear == "2024/25") |> 
  dplyr::group_by(syear) |>
  dplyr::filter(group == "Insgesamt") |> 
  dplyr::mutate(n_overall = sum(number),
                percent = round(number/n_overall*100, 2))


# Start here

# Save retention data as JSON file
#retention |> 
  #jsonlite::write_json("src/app_updates/retention.json", pretty = TRUE)


# Task 01: Dispay Diffs of Retention as Stats in the Header (Compare to last year): Grundschule: -0.5%


# Read the JSON file back into R
retention_json <- jsonlite::fromJSON("src/app_updates/retention.json")

# The Main Plot for the APP: Let User pick year
retention_json |> 
  dplyr::filter(syear == "2024/25") |> 
  ggplot(aes(x = syear, y = percent, fill = stype)) +
    geom_bar(stat = "identity") +
    theme_minimal()+
    coord_flip()+
    labs(x = "Schuljahr", y = "Prozent")



# Task 2: Second Tab: Show the development of retention over the years (line plot)

retention_json |> 
  dplyr::filter(group == "Insgesamt") |> 
  ggplot(aes(x = syear, y = number, group = stype, color = stype)) +
  geom_line(linewidth = 1) +
  geom_point() +
  theme_minimal()


# Task 3: Data Tab => Leave the tab (from penguins) as it is, I'll adjust later

