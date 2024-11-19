#!/bin/bash

# Define file paths
header_file="components/subheader.html"
temp_file="components/subheader_temp.html"
tablist_file="tablist"

cp "$header_file" "${header_file}.bak"

cp "$header_file" "$temp_file"

# Extract the part of the file before and including the "Home" link
sed -n '/<!-- Secondary Navbar -->/,/<a class="nav-link" href="\/index.html">Home<\/a>/p' "$header_file" > "$temp_file"

# Add the new links from the tablist file, replacing the section between "Home" and the User Greeting
echo "    <!-- New Navbar Links from tablist -->" >> "$temp_file"
for folder in $(cat "$tablist_file"); do
    echo "    <a class=\"nav-link\" href=\"/$folder\">$folder</a>" >> "$temp_file"
done

# Append everything after the "User Greeting and Dropdown" section (keep it unchanged)
sed -n '/<!-- User Greeting and Dropdown -->/,$p' "$header_file" >> "$temp_file"

echo "  </div>" >> "$temp_file"
echo "</nav>" >> "$temp_file"

mv "$temp_file" "$header_file"

echo "Navbar updated successfully!"
