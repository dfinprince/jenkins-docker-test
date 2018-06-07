node {
    try{
        def app
        docker.image('node:latest').inside {
            stage('Clone repository') {
        /*      sh 'git --version'
                echo "Branch: ${env.BRANCH_NAME}"
                sh 'printenv'
                sh 'docker -v'*/
                checkout scm
                }
            stage('Build image') {
                /*   sh 'docker -v'*/
                app = docker.build("dfsco1prince/jenkins-dockernode")
                }
            stage('Test image') {
                app.inside {
                    sh 'echo "Tests passed"'
                }
            }
            stage('Push image') {
            /* Push the image with two tags:
            * First, the incremental build number from Jenkins
            * Second, the 'latest' tag.
            * Pushing multiple tags is cheap, as all the layers are reused. */
            docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                app.push("${env.BUILD_NUMBER}")
                app.push("latest")
                }
            }
        }
    }
    catch(err){
        echo "Error in Jenkins Pipeline"
    }
}


node {
    try{
        docker.image('node:9.11.1-alpine').inside {
            stage('Checkout') {
                checkout scm
            }
            stage('Build and run auditboard test') {
                sh 'docker-compose run api-test'
            }
            stage('Remove docker containers') {
                sh 'docker-compose --rm -f api-test'
            }
            stage('Deploy') {
                if (env.BRANCH_NAME == 'master') {
                    sh 'docker-compose run --service-ports api-dev'
                    sh 'docker tag auditboard localhost:8000'
                }
            }
        }
    
}