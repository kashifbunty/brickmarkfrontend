#!/bin/bash

set -e

# Function to display status messages
status_message() {
    echo "==== $1 ===="
}

# Check if Node.js is installed
check_node() {
    if ! command -v node &> /dev/null; then
        status_message "Node.js not found. Installing Node.js..."
        install_node
    else
        status_message "Node.js is already installed."
    fi
}

# Install Node.js
install_node() {
    status_message "Installing Node.js"
    wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
    nvm install 20
}

# Check if node_modules exist and install if not
check_node_modules() {
    if [ -d "node_modules" ]; then
        status_message "Node modules found. Skipping npm install."
    else
        status_message "Node modules not found. Installing dependencies."
        npm install
    fi
}

# Check SEO flag from .env
check_seo() {
    if [ "$NEXT_PUBLIC_SEO" = "true" ]; then
        status_message "SEO is enabled. Updating .htaccess and package.json"
        update_htaccess_seo
        return 0
    else
        status_message "SEO is disabled. Setting up static routing"
        update_htaccess_static
        generate_out_folder
        return 1
    fi
}

# Find available port for the app
find_available_port() {
    # Try port 3000, 3001, etc. and return the first available one
    for port in {3000..3100}; do
        if ! lsof -i:$port &> /dev/null; then
            echo $port
            return 0
        fi
    done
    echo "No available ports found!" >&2
    return 1
}

# Update .htaccess and package.json for SEO
update_htaccess() {
    # Find an available port
    PORT=$(find_available_port)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    echo "Found available port: $PORT"

    # Update package.json with the new port
    status_message "Updating package.json with the port $PORT"
    sed -i '' "s/NODE_PORT=[0-9]*/NODE_PORT=$PORT/" package.json

    # Update .htaccess for port forwarding
    status_message "Updating .htaccess for port forwarding"
    cp .htaccess .htaccess.bak
    cat <<EOL > .htaccess
<IfModule mod_rewrite.c>
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /404/404.html [L]
    RewriteRule ^/?(.*)$ http://127.0.0.1:$PORT/\$1 [P]
</IfModule>
EOL
}

# Generate out folder
generate_out_folder() {
    status_message "Generating out folder"
    if npm run export; then
        status_message "Out folder generation successful!"
        echo ""
        echo "✅ Next steps:"
        echo "1. Upload the contents of the 'out' folder to your web domain directory"
        echo "2. Make sure to copy the .htaccess file to the root of your web directory"
        echo "3. Ensure mod_rewrite is enabled on your server"
        echo "4. Your static website is ready to serve!"
        echo ""
    else
        status_message "Failed to generate out folder"
        exit 1
    fi
}

# Update .htaccess for SEO enabled
update_htaccess_seo() {
    # Find an available port
    PORT=$(find_available_port)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    echo "Found available port: $PORT"

    # Update package.json with the new port
    status_message "Updating package.json with the port $PORT"
    sed -i '' "s/NODE_PORT=[0-9]*/NODE_PORT=$PORT/" package.json

    # Update .htaccess for port forwarding
    status_message "Updating .htaccess for port forwarding"
    cp .htaccess .htaccess.bak
    cat <<EOL > .htaccess
<IfModule mod_rewrite.c>
    RewriteRule ^index.html http://127.0.0.1:$PORT/\$1 [P]
    RewriteRule ^index.php http://127.0.0.1:$PORT/\$1 [P]
    RewriteRule ^/?(.*)$ http://127.0.0.1:$PORT/\$1 [P]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /404/404.html [L]
</IfModule>
EOL
}

# Update .htaccess for static routing (SEO disabled)
update_htaccess_static() {
    status_message "Creating .htaccess with static routes"
    cp .htaccess .htaccess.bak
    cat <<EOL > .htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    RewriteRule ^properties-details/([^/]+)/$ properties-details/[slug]/index.html [L]
    RewriteRule ^agent-details/([^/]+)/$ agent-details/[slug]/index.html [L]
    RewriteRule ^project-details/([^/]+)/$ project-details/[slug]/index.html [L]
    RewriteRule ^article-details/([^/]+)/$ article-details/[slug]/index.html [L]
    RewriteRule ^properties/categories/([^/]+)/$ properties/categories/[slug]/index.html [L]
    RewriteRule ^properties/city/([^/]+)/$ properties/city/[slug]/index.html [L]
    RewriteRule ^about-us$ /about-us.html [L]
    RewriteRule ^all-categories$ /all-categories.html [L]
    RewriteRule ^articles$ /articles.html [L]
    RewriteRule ^contact-us$ /contact-us.html [L]
    RewriteRule ^all-projects$ /all-projects.html [L]
    RewriteRule ^featured-properties$ /featured-properties.html [L]
    RewriteRule ^all-agents$ /all-agents.html [L]
    RewriteRule ^most-viewed-properties$ /most-viewed-properties.html [L]
    RewriteRule ^mostfav-properties$ /mostfav-properties.html [L]
    RewriteRule ^privacy-policy$ /privacy-policy.html [L]
    RewriteRule ^properties/all-properties$ /properties/all-properties.html [L]
    RewriteRule ^properties-nearby-city$ /properties-nearby-city.html [L]
    RewriteRule ^search$ /search.html [L]
    RewriteRule ^subscription-plan$ /subscription-plan.html [L]
    RewriteRule ^terms-and-condition$ /terms-and-condition.html [L]
    RewriteRule ^user$ /user.html [L]
    RewriteRule ^user-register$ /user-register.html [L]
    RewriteRule ^user/advertisement$ /user/advertisement.html [L]
    RewriteRule ^user/dashboard$ /user/dashboard.html [L]
    RewriteRule ^user/edit-property$ /user/edit-property.html [L]
    RewriteRule ^user/add-project$ /user/add-project.html [L]
    RewriteRule ^user/edit-project$ /user/edit-project.html [L]
    RewriteRule ^user/favorites-properties$ /user/favorites-properties.html [L]
    RewriteRule ^user/notifications$ /user/notifications.html [L]
    RewriteRule ^user/profile$ /user/profile.html [L]
    RewriteRule ^user/personalize-feed$ /user/personalize-feed.html [L]
    RewriteRule ^user/projects$ /user/projects.html [L]
    RewriteRule ^user/properties$ /user/properties.html [L]
    RewriteRule ^user/subscription$ /user/subscription.html [L]
    RewriteRule ^user/transaction-history$ /user/transaction-history.html [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ /404/404.html [L]
</IfModule>
EOL
}

# Install PM2 if not installed
install_pm2() {
    if ! command -v pm2 &> /dev/null; then
        status_message "PM2 not found. Installing PM2."
        npm install -g pm2
    else
        status_message "PM2 is already installed."
    fi
}
handle_pm2() {
    status_message "Checking PM2 processes..."

    # Ensure the required environment variables are set
    if [ -z "$NEXT_PUBLIC_APPLICATION_NAME" ] || [ -z "$NEXT_PUBLIC_WEB_VERSION" ]; then
        status_message "Error: Environment variables NEXT_PUBLIC_APPLICATION_NAME or NEXT_PUBLIC_WEB_VERSION are not set."
        exit 1
    fi

    # Create the full process name
    PROCESS_NAME="$NEXT_PUBLIC_APPLICATION_NAME - $NEXT_PUBLIC_WEB_VERSION"
    status_message "Process name: $PROCESS_NAME"
    
 # Check if the process already exists
    existing_process=$(pm2 list | grep -i "$NEXT_PUBLIC_APPLICATION_NAME" | awk '{print $2, $12}')
    
    if [ -n "$existing_process" ]; then
        # Extract the existing process name and version from PM2 list
        existing_name=$(echo "$existing_process" | awk '{print $1}')
        existing_version=$(echo "$existing_process" | awk '{print $2}')
        
        # Compare the existing version with the current version
        if [ "$existing_version" == "$NEXT_PUBLIC_WEB_VERSION" ]; then
            # If the version matches, restart the process
            status_message "Found existing PM2 process with the same version. Restarting..."
            pm2 restart "$existing_name" || {
                status_message "Warning: Failed to restart the existing process."
            }
            return
        else
            # If the version doesn't match, stop the old process and delete it
            status_message "Found existing PM2 process with a different version. Stopping and deleting..."
            pm2 delete "$existing_name" || {
                status_message "Warning: Failed to delete existing process."
            }
        fi
    fi

    # Start a new process
    status_message "Starting new PM2 process..."
    if pm2 start npm --name "$PROCESS_NAME" -- start; then
        status_message "Successfully started PM2 process: $PROCESS_NAME"
        
        # Save the PM2 process list
        if pm2 save; then
            status_message "PM2 process list saved successfully"
        else
            status_message "Warning: Failed to save PM2 process list"
        fi
    else
        status_message "Failed to start PM2 process"
        exit 1
    fi
}


# Add this function to check PM2 status
check_pm2_status() {
    status_message "Checking PM2 process status..."
    
    # Display running processes
    echo "Current PM2 processes:"
    pm2 list
    
    # Check if our process is running
    PROCESS_NAME="$NEXT_PUBLIC_APPLICATION_NAME - $NEXT_PUBLIC_WEB_VERSION"
    if pm2 list | grep -q "$PROCESS_NAME"; then
        echo "✅ Process $PROCESS_NAME is running"
        pm2 show "$PROCESS_NAME"
    else
        echo "❌ Process $PROCESS_NAME is not running"
        return 1
    fi
}
# Add PM2 startup script
add_pm2_startup() {
    status_message "Setting up PM2 startup script..."
    pm2 startup
    pm2 save
    status_message "PM2 startup script added and processes saved."
}

# Main installation procedure
main() {
    status_message "Starting installation process..."

    # Load environment variables from .env file
    if [ -f .env ]; then
        set -o allexport
        source .env
        set +o allexport
    else
        echo ".env file not found! Please make sure the environment variables are set."
        exit 1
    fi

    if [ -z "$NEXT_PUBLIC_WEB_VERSION" ]; then
        echo "NEXT_PUBLIC_WEB_VERSION is not set. Please set it in the .env file."
        exit 1
    fi

    # Check if Node.js is installed
    check_node

    # Check for node_modules and install dependencies
    check_node_modules

    # SEO flag check
    check_seo

    # Install PM2 if not installed
    install_pm2

    # Handle the PM2 process
    handle_pm2

    # check pm2 status 
    check_pm2_status

    # Add PM2 startup script
    add_pm2_startup
}

main
