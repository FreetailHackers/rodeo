import os
import discord
from discord.ext import commands
from dotenv import load_dotenv

dotenv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))

load_dotenv(dotenv_path)

DISCORD_TOKEN = os.getenv('DISCORD_TOKEN')

bot = commands.Bot(
    command_prefix="r?", intents=discord.Intents.all(), help_command=None
)

@bot.event
async def on_ready():
    print(f"Logged in as {bot.user}")
    await bot.change_presence(activity=discord.Game("r?help"))

    for file in os.listdir("discord-bot/cogs"):
        print(file)
        if file.endswith(".py") and file != "data.py":
            await bot.load_extension(f"cogs.{file[:-3]}")

@bot.event
async def on_message(message):
    if message.author == bot.user:
        return
    if not message.guild:
        return  # Ignore messages sent in DMs
    await bot.process_commands(message)

@bot.command()
async def reload(ctx, cog):
    try:
        bot.unload_extension(cog)
        bot.load_extension(cog)
        await ctx.send(f"{cog} reloaded successfully.")
    except Exception as e:
        await ctx.send(f"Error reloading {cog}: {e}")


@bot.command()
@commands.is_owner()
async def shutdown(ctx):
    await ctx.send("Shutting down...")
    await bot.close()

bot.run(DISCORD_TOKEN)
