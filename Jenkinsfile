pipeline {
    // TODO: wrap entire Jenkinsfile in a kubernetes builder?
    agent any

    stages {
        stage('Clone') {
            steps {
                checkout scm
            }
        }

        stage('Install Nx') {
            steps {
                sh 'npm i --location=global nx'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Build') {
            steps {
                sh 'nx run-many --all --targets=build'
            }
        }

        stage('Test') {
            steps {
                sh 'nx run-many --all --targets=test'
            }
        }

        // TODO: docker build and push!
        // stage('Deploy') {
        //     steps {
        //         sh 'npm run deploy'
        //     }
        // }
    }

    post {
        success {
            echo 'Build and test pipeline passed. Deploying...'
            // Add deployment steps here
        }

        failure {
            echo 'Build and test pipeline failed. Not deploying.'
        }
    }
}