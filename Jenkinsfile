pipeline {
    agent any

    environment {
        // Node.js version
        NODE_VERSION = '20.x'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Node.js') {
            steps {
                script {
                    // Requires NodeJS plugin in Jenkins
                    def nodeHome = tool name: 'Node20', type: 'jenkins.plugins.nodejs.tools.NodeJSInstallation'
                    env.PATH = "${nodeHome}/bin:${env.PATH}"
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install -g pnpm'
                sh 'pnpm install'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm run build'
            }
        }

        stage('Deploy to Aliyun') {
            steps {
                // You need to install 'Publish Over SSH' plugin in Jenkins
                // and configure the server named 'AliyunServer' in Jenkins Global Configuration
                sshPublisher(
                    publishers: [
                        sshPublisherDesc(
                            configName: 'AliyunServer',
                            transfers: [
                                sshTransfer(
                                    cleanRemote: false,
                                    excludes: '',
                                    execCommand: '',
                                    execTimeout: 120000,
                                    flatten: false,
                                    makeEmptyDirs: false,
                                    noDefaultExcludes: false,
                                    patternSeparator: '[, ]+',
                                    remoteDirectory: '/var/www/novel', // Update to your Nginx root path
                                    remoteDirectorySDF: false,
                                    removePrefix: 'novel',
                                    sourceFiles: 'novel/**/*'
                                )
                            ],
                            usePromotionTimestamp: false,
                            useWorkspaceInPromotion: false,
                            verbose: true
                        )
                    ]
                )
            }
        }
    }
}
