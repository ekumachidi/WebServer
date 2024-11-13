#!/bin/bash

side_menu_file="components/side-menu.html"
temp_file="components/side-menu_temp.html"
tablist_file="tablist"

cp "$side_menu_file" "${side_menu_file}.bak"

cp "$side_menu_file" "$temp_file"

# Extract everything up to and including the "Home" link
sed -n '/<!-- Side Menu -->/,/<a class="menu-item" href="\/index.html">Home<\/a>/p' "$side_menu_file" > "$temp_file"
echo "    </li>" >> "$temp_file"

# Add the dynamic links from the tablist file
echo "    <!-- New Menu Links from tablist -->" >> "$temp_file"
for folder in $(cat "$tablist_file"); do
    echo "    <li class=\"menu-item\">" >> "$temp_file"
    echo "      <a class=\"menu-item\" href=\"/$folder\">$folder</a>" >> "$temp_file"

    # Check if a tablist file exists in the folder and generate sub-menu if it does
    if [ -f "$folder/tablist" ]; then
        echo "      <!-- Sub-menu for $folder -->" >> "$temp_file"
        for sub_folder in $(cat "$folder/tablist"); do
            echo "        <li class=\"menu-item\">" >> "$temp_file"
            echo "          <a class=\"menu-item\" href=\"/$folder/$sub_folder\">$sub_folder</a>" >> "$temp_file"
            echo "        </li>" >> "$temp_file"
        done
    fi

    echo "    </li>" >> "$temp_file"
done

# Append the "Log Out" link and everything else after that (keeping it unchanged)
sed -n '/<a class="menu-item" href="\/login.html">Log Out<\/a>/,$p' "$side_menu_file" >> "$temp_file"

# Replace the original side-menu.html with the updated content
mv "$temp_file" "$side_menu_file"

echo "Side menu updated successfully!"
