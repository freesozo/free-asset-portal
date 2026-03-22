#!/usr/bin/env python3
"""Post the next unposted tweet from tweets/tweets.json via X API v2."""

import json
import os
import sys

import tweepy


def get_client():
    """Create an authenticated X API v2 client."""
    return tweepy.Client(
        consumer_key=os.environ["X_API_KEY"],
        consumer_secret=os.environ["X_API_SECRET"],
        access_token=os.environ["X_ACCESS_TOKEN"],
        access_token_secret=os.environ["X_ACCESS_TOKEN_SECRET"],
    )


def main():
    tweets_path = "tweets/tweets.json"

    with open(tweets_path, "r", encoding="utf-8") as f:
        tweets = json.load(f)

    # Find next unposted tweet
    next_tweet = None
    for t in tweets:
        if not t.get("posted", False):
            next_tweet = t
            break

    if next_tweet is None:
        print("All tweets have been posted! Resetting for next cycle...")
        for t in tweets:
            t["posted"] = False
            t.pop("tweet_id", None)
        next_tweet = tweets[0]

    # Post to X
    client = get_client()
    try:
        response = client.create_tweet(text=next_tweet["tweet"])
        tweet_id = response.data["id"]
        print(f"Posted tweet #{next_tweet['index']}: {next_tweet['site_name']}")
        print(f"Tweet ID: {tweet_id}")

        next_tweet["posted"] = True
        next_tweet["tweet_id"] = tweet_id

    except Exception as e:
        print(f"Error posting tweet: {e}", file=sys.stderr)
        sys.exit(1)

    # Save updated state
    with open(tweets_path, "w", encoding="utf-8") as f:
        json.dump(tweets, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    main()
