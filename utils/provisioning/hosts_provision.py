import os
import sys


def main():

    if len(sys.argv) != 3:
        print("Error: Expected exactly four command-line arguments.")
        return

    # Parse command-line arguments
    topologies_dir, available_hosts = sys.argv[1:3]

    # Read all the json files in the folder `topologies_folder`
    json_files = [
        pos_json
        for pos_json in os.listdir(topologies_dir)
        if pos_json.endswith(".json")
    ]

    print(json_files)

    print(available_hosts)
